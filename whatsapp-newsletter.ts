import { generateMessageIDV2 } from '@whiskeysockets/baileys';
import sharp, { type Metadata } from 'sharp';

export class NewsletterError extends Error {
  messageId?: string;
  constructor(message: string, public statusCode = 502, public errorCode = 'ERR_NEWSLETTER', public upstreamCode?: string) {
    super(message);
    this.name = 'NewsletterError';
  }
}

export function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/https?:\/\/\S+/gi, '[redacted URL]').slice(0, 500);
}

const configuredLimit = Number(process.env.WA_MEDIA_MAX_BYTES);
const MAX_BYTES = Number.isSafeInteger(configuredLimit) && configuredLimit > 0 ? configuredLimit : 32 * 1024 * 1024;

function decodeBase64(value: string): Buffer {
  const data = value.replace(/\s+/g, '');
  if (!data || data.length > Math.ceil(MAX_BYTES / 3) * 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(data) || data.length % 4 === 1) {
    throw new NewsletterError('Invalid or oversized base64 media.', 400, 'ERR_MEDIA_BASE64');
  }
  const buffer = Buffer.from(data, 'base64');
  if (buffer.toString('base64').replace(/=+$/, '') !== data.replace(/=+$/, '')) {
    throw new NewsletterError('Invalid base64 encoding.', 400, 'ERR_MEDIA_BASE64');
  }
  return buffer;
}

async function fetchMedia(url: string): Promise<Buffer> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      await response.body?.cancel();
      throw new NewsletterError(`Media source returned HTTP ${response.status}.`, 502, 'ERR_MEDIA_SOURCE_HTTP', String(response.status));
    }
    if (Number(response.headers.get('content-length')) > MAX_BYTES) {
      await response.body?.cancel();
      throw new NewsletterError('Media exceeds the configured size limit.', 413, 'ERR_MEDIA_SIZE');
    }
    if (!response.body) throw new NewsletterError('Empty media response.', 400, 'ERR_MEDIA_EMPTY');
    const reader = response.body.getReader();
    const chunks: Buffer[] = [];
    let size = 0;
    try {
      while (true) {
        const item = await reader.read();
        if (item.done) break;
        size += item.value.byteLength;
        if (size > MAX_BYTES) {
          await reader.cancel();
          throw new NewsletterError('Media exceeds the configured size limit.', 413, 'ERR_MEDIA_SIZE');
        }
        chunks.push(Buffer.from(item.value));
      }
    } finally {
      reader.releaseLock();
    }
    return Buffer.concat(chunks, size);
  } catch (error) {
    if (error instanceof NewsletterError) throw error;
    throw new NewsletterError(controller.signal.aborted ? 'Media source download timed out.' : 'Media source could not be downloaded.', controller.signal.aborted ? 504 : 502, 'ERR_MEDIA_SOURCE');
  } finally {
    clearTimeout(timeout);
  }
}

export async function extractMediaBufferAndMime(mediaUrl: string, _mediaTypeHint?: string) {
  if (typeof mediaUrl !== 'string' || !mediaUrl.trim()) {
    throw new NewsletterError('A media file is required.', 400, 'ERR_MEDIA_EMPTY');
  }
  const source = mediaUrl.trim();
  let buffer: Buffer;
  if (/^data:/i.test(source)) {
    const comma = source.indexOf(',');
    if (comma < 0 || !/;base64$/i.test(source.slice(0, comma))) {
      throw new NewsletterError('Expected a base64 data URI.', 400, 'ERR_MEDIA_DATA_URI');
    }
    buffer = decodeBase64(source.slice(comma + 1));
  } else if (/^https?:\/\//i.test(source)) {
    buffer = await fetchMedia(source);
  } else if (/^blob:/i.test(source)) {
    throw new NewsletterError('A browser blob URL cannot be read by the server. Upload the file bytes.', 400, 'ERR_MEDIA_BLOB_URL');
  } else {
    buffer = decodeBase64(source);
  }
  if (!buffer.length || buffer.length > MAX_BYTES) {
    throw new NewsletterError('Media is empty or exceeds the configured size limit.', buffer.length ? 413 : 400, 'ERR_MEDIA_SIZE');
  }

  // Container detection does not imply a supported video codec.
  if (buffer.length >= 16 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12);
    if (!['isom', 'iso2', 'iso3', 'iso4', 'iso5', 'iso6', 'mp41', 'mp42', 'avc1', 'M4V ', 'MSNV', 'dash'].includes(brand)) {
      throw new NewsletterError('Use an MP4 video with H.264 video and AAC audio. Renaming MOV/HEIC to MP4 is not conversion.', 415, 'ERR_MEDIA_VIDEO_FORMAT');
    }
    return { buffer, mimeType: 'video/mp4', isVideo: true, sizeKb: Math.ceil(buffer.length / 1024) };
  }

  // JPEG/PNG remain in their original format; static WebP/GIF are converted to PNG.
  let metadata: Metadata;
  try {
    metadata = await sharp(buffer, { limitInputPixels: 40_000_000, failOn: 'error' }).metadata();
  } catch {
    throw new NewsletterError('Invalid image or unsupported video. Use JPEG/PNG or H.264/AAC MP4.', 415, 'ERR_MEDIA_FORMAT');
  }
  if ((metadata.pages ?? 1) > 1) {
    throw new NewsletterError('Convert animated GIF/WebP to an MP4 video before sending.', 415, 'ERR_MEDIA_ANIMATION');
  }
  let mimeType: string;
  if (metadata.format === 'jpeg' || metadata.format === 'png') {
    mimeType = metadata.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  } else if (metadata.format === 'webp' || metadata.format === 'gif') {
    buffer = await sharp(buffer, { limitInputPixels: 40_000_000, failOn: 'error' }).png().toBuffer();
    mimeType = 'image/png';
  } else {
    throw new NewsletterError('Unsupported image format. Export the image as JPEG or PNG.', 415, 'ERR_MEDIA_FORMAT');
  }
  if (buffer.length > MAX_BYTES) throw new NewsletterError('Converted image exceeds the size limit.', 413, 'ERR_MEDIA_SIZE');
  return { buffer, mimeType, isVideo: false, sizeKb: Math.ceil(buffer.length / 1024) };
}

export type DeliveryState = 'SUBMITTED' | 'SERVER_ACK' | 'FAILED';
export interface NewsletterOutcome {
  messageId: string;
  targetJid: string;
  state: DeliveryState;
  deliveryConfirmed: false;
  upstreamCode?: string;
  errorMessage?: string;
}

interface PendingRecord {
  outcome: NewsletterOutcome;
  createdAt: number;
  settle?: () => void;
}

/** Observe real Baileys rc14 ACK and messages.update events; no invented delivery receipt. */
export function createNewsletterSender(socket: any, onOutcome: (outcome: NewsletterOutcome) => void = () => {}, ackWaitMs = 2_000) {
  const records = new Map<string, PendingRecord>();
  const maxRecords = 500;
  const keepMs = 10 * 60_000;
  let disposed = false;

  function prune() {
    const cutoff = Date.now() - keepMs;
    for (const [id, item] of records) if (item.createdAt < cutoff && !item.settle) records.delete(id);
  }
  function update(id: string, jid: string | undefined, error?: string) {
    const record = records.get(id);
    if (!record || (jid && jid !== record.outcome.targetJid)) return;
    if (record.outcome.state === 'FAILED') return;
    record.outcome = {
      ...record.outcome,
      state: error ? 'FAILED' : 'SERVER_ACK',
      upstreamCode: error,
      errorMessage: error ? `WhatsApp rejected the channel message (code ${error}).` : undefined,
      deliveryConfirmed: false
    };
    record.settle?.();
    onOutcome({ ...record.outcome });
  }
  const onAck = (node: any) => {
    const attrs = node?.attrs;
    if (typeof attrs?.id === 'string') update(attrs.id, attrs.from, attrs.error ? String(attrs.error) : undefined);
  };
  const onMessages = (events: any[]) => {
    for (const event of events || []) {
      if (event.update?.status === 0) {
        update(event.key?.id, event.key?.remoteJid, String(event.update?.messageStubParameters?.[0] || 'UNKNOWN'));
      }
    }
  };
  socket.ws?.on('CB:ack,class:message', onAck);
  socket.ev.on('messages.update', onMessages);

  return {
    async send(jid: string, content: any) {
      if (!/^\d+@newsletter$/.test(jid)) throw new NewsletterError('A resolved numeric newsletter JID is required.', 400, 'ERR_NEWSLETTER_JID');

      if (disposed) {
        // If sender instance was marked disposed but underlying socket is actually connected, send via socket safely
        if (socket && socket.ws?.readyState === 1 && typeof socket.sendMessage === 'function') {
          const id = generateMessageIDV2(socket.user?.id);
          const message = await socket.sendMessage(jid, content, { messageId: id, mediaUploadTimeoutMs: 60_000 });
          return {
            message,
            delivery: {
              messageId: id,
              targetJid: jid,
              state: 'SUBMITTED' as const,
              deliveryConfirmed: false as const
            }
          };
        }
        throw new NewsletterError('WhatsApp connection changed. Check the session before retrying.', 503, 'ERR_WHATSAPP_DISCONNECTED');
      }

      prune();
      if (records.size >= maxRecords) {
        const oldest = [...records].find(([, item]) => !item.settle);
        if (oldest) records.delete(oldest[0]);
        else throw new NewsletterError('Too many pending channel sends.', 429, 'ERR_NEWSLETTER_BUSY');
      }
      const id = generateMessageIDV2(socket.user?.id);
      const record: PendingRecord = {
        createdAt: Date.now(),
        outcome: { messageId: id, targetJid: jid, state: 'SUBMITTED', deliveryConfirmed: false }
      };
      let resolveSignal!: () => void;
      const signal = new Promise<void>(resolve => { resolveSignal = resolve; });
      record.settle = resolveSignal;
      records.set(id, record); // Register before dispatch, so a fast rejection cannot be missed.
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const message = await socket.sendMessage(jid, content, { messageId: id, mediaUploadTimeoutMs: 60_000 });
        if (!message?.key?.id || message.key.id !== id) {
          return { message, delivery: { ...record.outcome } };
        }
        if (record.outcome.state === 'SUBMITTED' && !disposed) {
          await Promise.race([signal, new Promise<void>(resolve => { timer = setTimeout(resolve, ackWaitMs); })]);
        }
        if (record.outcome.state === 'FAILED') {
          throw new NewsletterError(record.outcome.errorMessage!, 502, 'ERR_NEWSLETTER_REJECTED', record.outcome.upstreamCode);
        }
        return { message, delivery: { ...record.outcome } };
      } catch (error) {
        if (record.outcome.state !== 'FAILED') {
          // An exception may occur after dispatch. Do not infer safe automatic retry.
          record.outcome.errorMessage = safeErrorMessage(error);
        }
        const failure = error instanceof Error ? error : new NewsletterError(safeErrorMessage(error));
        (failure as NewsletterError).messageId = id;
        throw failure;
      } finally {
        if (timer) clearTimeout(timer);
        record.settle = undefined;
      }
    },
    getOutcome(messageId: string) {
      const record = records.get(messageId);
      return record ? { ...record.outcome } : undefined;
    },
    isDisposed() {
      return disposed;
    },
    dispose() {
      disposed = true;
      socket.ws?.off('CB:ack,class:message', onAck);
      socket.ev.off('messages.update', onMessages);
      for (const record of records.values()) record.settle?.();
      records.clear();
    }
  };
}

export async function createDiagnosticPng(): Promise<Buffer> {
  return sharp({ create: { width: 320, height: 180, channels: 3, background: '#16a34a' } }).png().toBuffer();
}
