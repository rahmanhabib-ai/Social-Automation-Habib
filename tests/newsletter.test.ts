import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import https from 'node:https';
import { Readable, Writable } from 'node:stream';
import { createRequire, syncBuiltinESMExports } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import pino from 'pino';
import sharp from 'sharp';
import { prepareWAMessageMedia, getWAUploadToServer } from '@whiskeysockets/baileys';
import { createNewsletterSender, createDiagnosticPng, extractMediaBufferAndMime, NewsletterError } from '../whatsapp-newsletter';

const require = createRequire(import.meta.url);
const { applyPatch } = require('../scripts/patch-baileys-newsletter.cjs');
const packageRoot = path.dirname(require.resolve('@whiskeysockets/baileys/package.json'));
const manifest = require('../patches/baileys-newsletter-rc14.json');
const jid = '120363429504227753@newsletter';
const logger = pino({ level: 'silent' });

test('input parsing validates bytes instead of trusting a declared MIME', async () => {
  const png = await createDiagnosticPng();
  const result = await extractMediaBufferAndMime('data:video/mp4;base64,' + png.toString('base64'));
  assert.equal(result.mimeType, 'image/png');
  assert.equal(result.isVideo, false);
  assert.deepEqual(result.buffer, png);
  const webp = await sharp(png).webp().toBuffer();
  const converted = await extractMediaBufferAndMime(webp.toString('base64'));
  assert.equal(converted.mimeType, 'image/png');
  assert.equal((await sharp(converted.buffer).metadata()).format, 'png');
});

test('invalid input is rejected rather than passed to Baileys as a URL', async () => {
  for (const value of ['blob:https://example.com/id', 'data:image/png,not-base64', 'data:image/png;base64,???', Buffer.from('<html>not an image</html>').toString('base64')]) {
    await assert.rejects(extractMediaBufferAndMime(value), NewsletterError);
  }
});

test('channel preparation uses raw upload and server metadata, with no encryption URL fields', async () => {
  const png = await createDiagnosticPng();
  let uploadedPath = '';
  const media = await prepareWAMessageMedia({ image: png, mimetype: 'image/png', caption: 'বাংলা পরীক্ষা' }, {
    jid, logger,
    upload: async (file, options: any) => {
      uploadedPath = file;
      assert.equal(options.newsletter, true);
      assert.deepEqual(await fs.readFile(file), png);
      return { mediaUrl: 'https://example.invalid/unused', directPath: '/m1/test', thumbnailDirectPath: '/m1/thumb', thumbnailSha256: Buffer.alloc(32, 7).toString('base64') };
    }
  });
  assert.equal(media.imageMessage?.directPath, '/m1/test');
  assert.equal(media.imageMessage?.caption, 'বাংলা পরীক্ষা');
  assert.ok(!media.imageMessage?.url);
  assert.ok(!media.imageMessage?.mediaKey);
  assert.ok(!media.imageMessage?.fileEncSha256);
  assert.equal(media.imageMessage?.thumbnailDirectPath, '/m1/thumb');
  assert.equal(media.imageMessage?.thumbnailSha256?.length, 32);
  await assert.rejects(fs.access(uploadedPath));
});

test('failed raw upload removes the temporary file', async () => {
  let temporary = '';
  await assert.rejects(prepareWAMessageMedia({ image: await createDiagnosticPng() }, {
    jid, logger, upload: async file => { temporary = file; throw new Error('simulated upload rejection'); }
  }), /simulated upload rejection/);
  await assert.rejects(fs.access(temporary));
});

test('real H.264/AAC MP4 fixture parses and prepares as raw channel video', async () => {
  const bytes = await fs.readFile(new URL('./fixtures/sample.mp4', import.meta.url));
  const media = await extractMediaBufferAndMime('data:video/mp4;base64,' + bytes.toString('base64'));
  assert.equal(media.mimeType, 'video/mp4');
  assert.equal(media.isVideo, true);
  const message = await prepareWAMessageMedia({ video: media.buffer, mimetype: media.mimeType }, {
    jid, logger, upload: async (file, options: any) => {
      assert.equal(options.newsletter, true);
      assert.equal(options.mediaType, 'video');
      assert.deepEqual(await fs.readFile(file), bytes);
      return { mediaUrl: '', directPath: '/m1/video' };
    }
  });
  assert.equal(message.videoMessage?.directPath, '/m1/video');
  assert.ok(!message.videoMessage?.url);
});

test('ordinary chat image remains encrypted', async () => {
  const png = await createDiagnosticPng();
  let encrypted = false;
  const result = await prepareWAMessageMedia({ image: png, mimetype: 'image/png', jpegThumbnail: Buffer.from([1]).toString('base64'), width: 320, height: 180 }, {
    jid: '8801700000000@s.whatsapp.net', logger,
    upload: async (file, options: any) => {
      assert.ok(!options.newsletter);
      encrypted = !(await fs.readFile(file)).equals(png);
      return { mediaUrl: 'https://example.invalid/encrypted', directPath: '/o1/encrypted' };
    }
  });
  assert.ok(encrypted);
  assert.equal(result.imageMessage?.mediaKey?.length, 32);
  assert.ok(result.imageMessage?.fileEncSha256);
});

test('actual upload factory chooses channel image/video paths while preserving regular uploads', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'newsletter-upload-'));
  const file = path.join(dir, 'input.bin');
  await fs.writeFile(file, await createDiagnosticPng());
  const originalRequest = https.request;
  const requests: any[] = [];
  try {
    https.request = ((options: any, callback: any) => {
      requests.push(options);
      return new Writable({
        write(_chunk, _encoding, done) { done(); },
        final(done) {
          const response = Readable.from([JSON.stringify({ direct_path: '/m1/test', thumbnail_info: { thumbnail_direct_path: '/m1/thumb', thumbnail_sha256: Buffer.alloc(32).toString('base64') } })]);
          Object.assign(response, { statusCode: 200, headers: {} });
          callback(response);
          done();
        }
      });
    }) as typeof https.request;
    syncBuiltinESMExports();
    const uploader = getWAUploadToServer({ customUploadHosts: [], logger, options: {} } as any, async () => ({ hosts: [{ hostname: 'example.invalid' }], auth: 'test-only', ttl: 60, fetchDate: new Date() } as any));
    const first = await uploader(file, { mediaType: 'image', fileEncSha256B64: 'abc', newsletter: true });
    await uploader(file, { mediaType: 'video', fileEncSha256B64: 'abc', newsletter: true });
    await uploader(file, { mediaType: 'image', fileEncSha256B64: 'abc' });
    assert.match(requests[0].path, /^\/newsletter\/newsletter-image\//);
    assert.match(requests[0].path, /server_thumb_gen=1/);
    assert.match(requests[1].path, /^\/newsletter\/newsletter-video\//);
    assert.match(requests[1].path, /server_transcode=1/);
    assert.match(requests[2].path, /^\/mms\/image\//);
    assert.doesNotMatch(requests[2].path, /server_thumb_gen/);
    assert.equal(first.thumbnailDirectPath, '/m1/thumb');
  } finally {
    https.request = originalRequest;
    syncBuiltinESMExports();
    await fs.rm(dir, { recursive: true, force: true });
  }
});

function fakeSocket(action?: (socket: any, id: string) => void) {
  const socket: any = { ws: new EventEmitter(), ev: new EventEmitter(), user: { id: '8801700000000@s.whatsapp.net' } };
  socket.sendMessage = async (_jid: string, _content: unknown, options: any) => {
    action?.(socket, options.messageId);
    return { key: { id: options.messageId, remoteJid: jid } };
  };
  return socket;
}

test('fast 479 ACK is caught even before sendMessage returns', async () => {
  const socket = fakeSocket((socket, id) => socket.ws.emit('CB:ack,class:message', { attrs: { id, from: jid, error: '479' } }));
  const sender = createNewsletterSender(socket, undefined, 5);
  await assert.rejects(sender.send(jid, { text: 'test' }), (error: any) => error.upstreamCode === '479' && error.statusCode === 502 && Boolean(error.messageId));
  sender.dispose();
});

test('accepted and unacknowledged calls never claim verified publication', async () => {
  for (const ack of [true, false]) {
    const socket = fakeSocket(ack ? (socket, id) => socket.ws.emit('CB:ack,class:message', { attrs: { id, from: jid } }) : undefined);
    const sender = createNewsletterSender(socket, undefined, 2);
    const result = await sender.send(jid, { text: 'test' });
    assert.equal(result.delivery.state, ack ? 'SERVER_ACK' : 'SUBMITTED');
    assert.equal(result.delivery.deliveryConfirmed, false);
    sender.dispose();
  }
});

test('late rejection is retained for diagnostic updates', async () => {
  const updates: any[] = [];
  const socket = fakeSocket();
  const sender = createNewsletterSender(socket, event => updates.push(event), 2);
  const result = await sender.send(jid, { text: 'test' });
  socket.ev.emit('messages.update', [{ key: { id: result.message.key.id, remoteJid: jid }, update: { status: 0, messageStubParameters: ['479'] } }]);
  assert.equal(updates.at(-1).state, 'FAILED');
  assert.equal(sender.getOutcome(result.message.key.id)?.upstreamCode, '479');
  sender.dispose();
  assert.equal(socket.ws.listenerCount('CB:ack,class:message'), 0);
});

test('patch can be checked, reverted, reapplied, and rejects unexpected package edits', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'newsletter-patch-'));
  try {
    await fs.copyFile(path.join(packageRoot, 'package.json'), path.join(dir, 'package.json'));
    for (const file of manifest.files) {
      await fs.mkdir(path.dirname(path.join(dir, file.path)), { recursive: true });
      await fs.copyFile(path.join(packageRoot, file.path), path.join(dir, file.path));
    }
    assert.equal(applyPatch(dir, 'check').changed, 0);
    assert.equal(applyPatch(dir, 'revert').changed, 4);
    assert.equal(applyPatch(dir).changed, 4);
    assert.equal(applyPatch(dir).changed, 0);
    applyPatch(dir, 'revert');
    const first = path.join(dir, manifest.files[0].path);
    const before = await fs.readFile(first, 'utf8');
    await fs.appendFile(path.join(dir, manifest.files.at(-1).path), '\n// incompatible edit');
    assert.throws(() => applyPatch(dir), /Unexpected contents/);
    assert.equal(await fs.readFile(first, 'utf8'), before);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
});

test('actual API handlers return unverified submission, real role lookup, and 479 rejection', async () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const dir = await fs.mkdtemp(path.join(root, 'tests/.route-check-'));
  let appModule: any;
  try {
    // In this temporary test build only, disable startup/network and expose injection.
    const original = await fs.readFile(path.join(root, 'server.ts'), 'utf8');
    assert.ok(original.includes('// Start initial session\nstartWhatsAppSession(false);'));
    const source = original
      .replace('// Start initial session\nstartWhatsAppSession(false);', '// Startup disabled only in this test build.')
      .replace(/\nstartServer\(\);\s*$/, '\n') + `
export { app };
export function setTestSocket(value) {
  newsletterSender?.dispose();
  sock = value;
  connectionStatus = 'connected';
  newsletterSender = createNewsletterSender(sock, updateNewsletterOutcome, 2);
}
export function closeTestSocket() { newsletterSender?.dispose(); }
`;
    const output = path.join(dir, 'server.mjs');
    await build({ stdin: { contents: source, resolveDir: root, sourcefile: 'server.ts', loader: 'ts' }, outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external', logLevel: 'silent' });
    appModule = await import(pathToFileURL(output).href);
    const invoke = async (route: string, body: unknown) => {
      const handler = appModule.app._router.stack.find((layer: any) => layer.route?.path === route).route.stack[0].handle;
      let status = 200;
      let payload: any;
      const response = { status(value: number) { status = value; return response; }, json(value: unknown) { payload = value; return response; } };
      await handler({ body }, response);
      return { status, payload };
    };
    let lookups = 0;
    const socket = fakeSocket((socket, id) => socket.ws.emit('CB:ack,class:message', { attrs: { id, from: jid } }));
    socket.newsletterMetadata = async () => { lookups++; return { id: jid, name: 'Test channel' }; };
    appModule.setTestSocket(socket);
    const customMediaUrl = 'data:image/png;base64,' + (await createDiagnosticPng()).toString('base64');
    const input = { channelIdOrLink: jid, caption: 'বাংলা পরীক্ষা', mediaUrl: customMediaUrl };
    const published = await invoke('/api/whatsapp/publish-channel', input);
    assert.equal(published.status, 202);
    assert.equal(published.payload.deliveryConfirmed, false);
    assert.equal(published.payload.channelRole, 'UNKNOWN');
    assert.equal(published.payload.deliveryStatus, 'SERVER_ACK');
    const diagnostic = await invoke('/api/whatsapp/test-newsletter-media', { channelIdOrLink: jid, customMediaUrl });
    assert.equal(diagnostic.status, 202);
    assert.equal(diagnostic.payload.diagnostic.status, 'SERVER_ACK');
    assert.ok(lookups >= 2);
    const rejecting = fakeSocket((socket, id) => socket.ws.emit('CB:ack,class:message', { attrs: { id, from: jid, error: '479' } }));
    rejecting.newsletterMetadata = socket.newsletterMetadata;
    appModule.setTestSocket(rejecting);
    const failed = await invoke('/api/whatsapp/publish-channel', input);
    assert.equal(failed.status, 502);
    assert.equal(failed.payload.upstreamCode, '479');
    assert.equal(failed.payload.success, false);
    assert.ok(failed.payload.attemptedMessageId);
  } finally {
    appModule?.closeTestSocket();
    await fs.rm(dir, { recursive: true, force: true });
  }
});
