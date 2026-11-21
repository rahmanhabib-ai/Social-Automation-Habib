# WhatsApp Channel মিডিয়া সংশোধন

এই প্যাকেজে আপনার দেওয়া `server.ts`, `package.json`, `bun.lock` এবং `package-lock.json` সংশোধন করা হয়েছে। নতুন helper ও patch ফাইলসহ সম্পূর্ণ ফাইল দেওয়া আছে। এটি আপনার বিদ্যমান প্রোজেক্টের ওপর প্রয়োগ করার পরিবর্তনসমষ্টি; frontend-এর সম্পূর্ণ প্রোজেক্ট এখানে নেই।

## কোডে নিশ্চিতভাবে পাওয়া সমস্যা

1. আপনার `bun.lock` অফিসিয়াল Baileys `7.0.0-rc14` নির্দিষ্ট করে। সেই একই npm প্যাকেজ পরীক্ষা করে দেখা গেছে, newsletter media-এর জন্য সাধারণ `/mms/image` ও `/mms/video` ব্যবহার হচ্ছিল।
2. Raw newsletter media message-এ সাধারণ media URL রাখা হচ্ছিল এবং `plaintext` node-এ `mediatype` দেওয়া হচ্ছিল না। এখানে চ্যানেলের নিজস্ব upload path, server-এর ফেরত দেওয়া directPath/thumbnail এবং media attribute ব্যবহার করা হয়েছে।
3. আপনার server-এর default cache-এ `OWNER` লিখে রাখা ছিল। এটি live role যাচাই ছিল না। এখন পাওয়া metadata অনুযায়ী role আসে; অনুপস্থিত হলে `UNKNOWN`।
4. `sendMessage()` ফিরলেই `DIAGNOSTIC_PASSED`/Delivered দেখানো হচ্ছিল। এখন API জমা দেওয়ার ফল ও WhatsApp rejection আলাদাভাবে জানায়। Message ID-র সঙ্গে ACK/error মেলানো হয়।
5. দেওয়া npm lockfile-এ Baileys-সহ কয়েকটি বর্তমান dependency অনুপস্থিত ছিল। npm lockfile পুনরায় তৈরি এবং Bun lockfile সমন্বয় করা হয়েছে।

মূল newsletter পরিবর্তন [Baileys PR #2434](https://github.com/WhiskeySockets/Baileys/pull/2434)-এর সঙ্গে মিলিয়ে rc14-এর জন্য সীমিতভাবে প্রয়োগ করা হয়েছে। ইনস্টলার নির্দিষ্ট version ও প্রতিটি পরিবর্তিত ফাইলের SHA256 যাচাই করে। অপ্রত্যাশিত version/আগের অন্য patch পেলে সেটি থামে। অন্য কোনো fork ইনস্টল করে না।

## ফাইলগুলো কোথায় রাখতে হবে

এখানে `PROJECT_ROOT` বলতে আপনার অ্যাপের বর্তমান `server.ts` থাকা ফোল্ডার বোঝানো হয়েছে। ZIP-এর ভেতরের relative path একই রেখে ফাইলগুলো রাখুন।

| ফাইল | পরিবর্তন |
|---|---|
| `PROJECT_ROOT/server.ts` | UPDATE — channel publisher, metadata ও diagnostic response |
| `PROJECT_ROOT/package.json` | UPDATE — rc14 pin, Sharp dependency, patch/start/test commands |
| `PROJECT_ROOT/package-lock.json` | UPDATE — বর্তমান npm dependency lock |
| `PROJECT_ROOT/bun.lock` | UPDATE — সমন্বিত Bun lock |
| `PROJECT_ROOT/whatsapp-newsletter.ts` | NEW — media input ও ACK/rejection handling |
| `PROJECT_ROOT/scripts/patch-baileys-newsletter.cjs` | NEW — যাচাইকৃত dependency patch প্রয়োগ/ফেরত নেওয়া |
| `PROJECT_ROOT/patches/baileys-newsletter-rc14.json` | NEW — version, checksum ও exact changes |
| `PROJECT_ROOT/patches/baileys-newsletter-rc14.patch` | NEW — পরিবর্তনের readable diff |
| `PROJECT_ROOT/scripts/send-newsletter-test.mjs` | NEW — নিজের ফাইল দিয়ে manual live test |
| `PROJECT_ROOT/tests/newsletter.test.ts` | NEW — ১২টি offline regression test |
| `PROJECT_ROOT/tests/fixtures/sample.mp4` | NEW — ছোট H.264/AAC MP4 test fixture |
| `PROJECT_ROOT/BAILEYS_PATCH_NOTICES.txt` | NEW — upstream attribution/license |
| `PROJECT_ROOT/verification.json` | NEW — কী পরীক্ষা হয়েছে এবং কী হয়নি |

নতুন route, database migration বা QR/session reset লাগছে না। Patch প্রয়োগ হয় install এবং dev/build/start-এর আগে। নতুন helper ও scripts/patches-সহ ফাইলগুলো একসঙ্গে রাখতে হবে।

## ইনস্টল ও চালানো

Node.js 22 LTS বা 24 ব্যবহার করুন; স্থানীয় যাচাই হয়েছে Node.js 24.19.0-তে। আগে বর্তমান source ফাইলগুলোর একটি কপি রাখুন, তারপর পরিবর্তিত ফাইল বসান। একই সময়ে চলমান backend process বন্ধ করে নতুনটি চালান।

প্রোজেক্টের root terminal-এ npm ব্যবহার করলে:

```bash
npm ci
npm run verify:whatsapp-patch
npm run test:whatsapp
npm run dev
```

প্রথম দুই ধাপে এমন ফল থাকবে:

```text
[Baileys] newsletter-image-video-rc14-1: apply OK (... files changed)
[Baileys] newsletter-image-video-rc14-1: check OK (0 files changed)
```

আগেই patch প্রয়োগ হয়ে থাকলে `apply OK (0 files changed)` স্বাভাবিক।

Bun ব্যবহার করা প্রোজেক্টে npm-এর পরিবর্তে:

```bash
bun install --frozen-lockfile
bun run verify:whatsapp-patch
bun run test:whatsapp
bun run dev
```

ইনস্টল করার জন্য একটি package manager বেছে নিন।

সম্পূর্ণ বিদ্যমান frontend প্রোজেক্টে production build/start:

```bash
npm run build
NODE_ENV=production npm start
```

Production backend এখন ESM হিসেবে `dist/server.mjs` তৈরি হয়। আপনার hosting command সরাসরি পুরনো `dist/server.cjs` চালালে সেটি `npm start`-এ পরিবর্তন করুন।

Google AI Studio-তে এই ফাইলগুলো সঠিক path-এ বসিয়ে dependencies install ও backend restart করুন। শুধু frontend build করা নতুন backend চালু হওয়ার প্রমাণ নয়।

## লাইভ টেস্ট: প্রথমে একটি PNG

অ্যাপের WhatsApp connection সক্রিয় থাকার পর দ্বিতীয় terminal বা Postman থেকে এই request দিন। এটি আপনার দেওয়া চ্যানেলে 320×180 আকারের সবুজ test image পাঠানোর চেষ্টা করবে।

```bash
curl -sS -X POST 'http://127.0.0.1:3000/api/whatsapp/test-newsletter-media' \
  -H 'Content-Type: application/json' \
  --data '{"channelIdOrLink":"120363429504227753@newsletter"}'
```

Postman: method `POST`, একই URL, Body → raw → JSON:

```json
{
  "channelIdOrLink": "120363429504227753@newsletter"
}
```

Remote app হলে localhost-এর জায়গায় আপনার অ্যাপের base URL দিন।

রিকোয়েস্ট জমা হলে HTTP `202` এবং এই ধরনের fields থাকবে; নিচের message ID একটি placeholder:

```json
{
  "success": true,
  "submitted": true,
  "deliveryStatus": "SUBMITTED",
  "deliveryConfirmed": false,
  "messageId": "<generated-message-id>"
}
```

WhatsApp ACK পাওয়া গেলে `deliveryStatus` হবে `SERVER_ACK`। দুই অবস্থাতেই `deliveryConfirmed: false` রাখা হয়, কারণ এই API অন্য follower-এর অ্যাপে ছবিটি দেখা যাওয়ার প্রমাণ পায় না। অন্য follower account দিয়ে চ্যানেলে সবুজ PNG-টি দেখা/ডাউনলোড করা যায় কি না দেখুন।

## নিজের ছবি ও MP4 পরীক্ষা

নিজের ছবির path বসিয়ে:

```bash
node scripts/send-newsletter-test.mjs './your-photo.jpg' '120363429504227753@newsletter'
```

সঙ্গে দেওয়া MP4 দিয়ে:

```bash
node scripts/send-newsletter-test.mjs './tests/fixtures/sample.mp4' '120363429504227753@newsletter'
```

Remote app হলে তৃতীয় argument-এ আপনার base URL দিন। এই script ফাইলকে data URI বানিয়ে বাস্তব diagnostic endpoint-এ পাঠায়। এটি নিজে বারবার retry করে না।

এরপর অ্যাপের নিয়মিত post publisher দিয়ে একটি JPEG/PNG + বাংলা caption এবং একটি MP4 পাঠিয়ে দেখুন। ব্যবহৃত endpoint আগেরটিই: `POST /api/whatsapp/publish-channel`।

## যদি WhatsApp প্রত্যাখ্যান করে

`479` প্রত্যাখ্যান ধরা পড়লে API `502` ফেরায় এবং JSON-এ পাওয়া যাবে:

```json
{
  "success": false,
  "errorCode": "ERR_NEWSLETTER_REJECTED",
  "upstreamCode": "479",
  "automaticRetry": false
}
```

এখানে `502` আপনার অ্যাপের HTTP response; `479` WhatsApp-এর protocol error। এগুলো একই জিনিস নয়।

পরে আসা rejection দেখার জন্য:

```bash
curl -sS 'http://127.0.0.1:3000/api/whatsapp/diagnostic-logs'
```

একাধিক মিডিয়ার কিছু জমা হওয়ার পরে পরেরটি ব্যর্থ হলে `partial`, `submittedMessageIds` এবং `attemptedMessageId` দেখুন। চ্যানেল পরীক্ষা করে প্রয়োজনীয় অবশিষ্ট ফাইল পাঠান; পুরো batch স্বয়ংক্রিয়ভাবে পুনরায় পাঠাবেন না।

## ফরম্যাট ও সীমা

- JPEG/PNG তাদের মূল ফরম্যাটে পাঠানো হয়। Static WebP/GIF PNG-তে রূপান্তর হয়।
- Animated GIF/WebP, MOV, WebM বা MKV-কে শুধু MP4 নামে চিহ্নিত করে পাঠানো হয় না; আগে উপযুক্ত MP4-তে রূপান্তর করতে হবে। MP4 container শনাক্ত করা হয়, সব codec-এর গ্রহণযোগ্যতা নিশ্চিত করা হয় না।
- ভিডিও পরীক্ষার জন্য H.264 video + AAC audio ব্যবহার করুন।
- Decoded media-এর default app limit 32 MiB; JSON parser limit 50 MB।
- Diagnostic status memory-তে থাকে। Message record সর্বোচ্চ ১০ মিনিট/৫০০টি রাখা হয়; এটি স্থায়ী delivery tracking service নয়।

প্রয়োজনে নিজস্ব পরিবেশে FFmpeg দিয়ে MOV/WebM রূপান্তরের উদাহরণ:

```bash
ffmpeg -i input.mov -c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart output.mp4
```

## কী যাচাই হয়েছে

- ১২/১২ offline test পাস: actual rc14 uploader path, raw newsletter metadata, normal-chat encryption, valid image/video input, fast/late rejection, actual Express route handlers এবং patch guard/rollback।
- `server.ts`, নতুন helper ও tests-এর TypeScript check পাস।
- Backend ESM bundle ও syntax check পাস।
- npm manifest/lockfile dependencies মিলেছে; Bun frozen lockfile check পাস।

WhatsApp-এ আপনার session দিয়ে live send করা হয়নি। Frontend source, index.html ও project tsconfig দেওয়া হয়নি বলে পুরো frontend build/visual UI যাচাই করা হয়নি। API এখন `202` ও delivery status দেয়; এই response-ই backend পরীক্ষার ভিত্তি।

## আগের অবস্থায় ফেরত নেওয়া

Backend বন্ধ করুন। নতুন scripts সরানোর আগে প্রোজেক্ট root-এ চালান:

```bash
node scripts/patch-baileys-newsletter.cjs --revert
```

তারপর নিজের backup-এর চারটি পুরনো source/manifest/lockfile ফিরিয়ে দিন। আগের Bun-ভিত্তিক install ব্যবহার করলে `bun install --frozen-lockfile` চালান; npm ব্যবহার করলে `npm install` চালিয়ে manifest অনুযায়ী lockfile তৈরি করুন। পুরনো build/start command দিয়ে backend চালান। নতুন helper/test/patch ফাইলগুলো মূল code আর import করবে না।
