import { readFile, stat } from 'node:fs/promises';

const [file, channelJid, baseUrl = 'http://127.0.0.1:3000'] = process.argv.slice(2);
if (!file || !/^\d+@newsletter$/.test(channelJid || '')) {
  console.error('Usage: node scripts/send-newsletter-test.mjs FILE CHANNEL_JID [APP_BASE_URL]');
  process.exitCode = 1;
} else {
  try {
    if ((await stat(file)).size > 32 * 1024 * 1024) throw new Error('Use a test file smaller than 32 MiB.');
    const bytes = await readFile(file);
    const response = await fetch(new URL('/api/whatsapp/test-newsletter-media', baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channelIdOrLink: channelJid, customMediaUrl: 'data:application/octet-stream;base64,' + bytes.toString('base64') }),
      signal: AbortSignal.timeout(150_000)
    });
    console.log(`Application HTTP status: ${response.status}`);
    console.log(await response.text());
    console.log('Verify appearance and playback in WhatsApp. A submitted/ACK result is not independent delivery confirmation.');
    if (!response.ok) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    console.error('Do not automatically retry after a timeout; check the channel and diagnostic logs first.');
    process.exitCode = 1;
  }
}
