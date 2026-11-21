import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';

export interface SocialPostGenerationOptions {
  topic: string;
  platform?: 'facebook' | 'telegram' | 'whatsapp' | 'instagram' | 'tiktok' | 'all';
  tone?: 'promotional' | 'casual' | 'professional' | 'urgent_deal' | 'storytelling';
  language?: 'bangla' | 'english' | 'banglish';
  productName?: string;
  productPrice?: number;
  discountPrice?: number;
  brandName?: string;
  customInstructions?: string;
  provider?: 'gemini' | 'openai' | 'claude' | 'deepseek';
  model?: string;
  apiKey?: string;
  openaiApiKey?: string;
  claudeApiKey?: string;
  deepseekApiKey?: string;
  imageEngine?: 'sharp-svg' | 'dall-e-3' | 'imagen-3';
}

export interface GeneratedSocialPost {
  headline: string;
  caption: string;
  hashtags: string[];
  imagePrompt: string;
  shortBroadcastSummary: string;
  callToAction: string;
  recommendedBannerTheme: 'blue_gradient' | 'cyber_purple' | 'emerald_glow' | 'sunset_orange' | 'dark_luxury';
}

export interface BannerGenerationOptions {
  headline: string;
  subtitle?: string;
  badge?: string;
  brandName?: string;
  priceTag?: string;
  originalPrice?: string;
  ctaText?: string;
  theme?: 'blue_gradient' | 'cyber_purple' | 'emerald_glow' | 'sunset_orange' | 'dark_luxury';
  width?: number;
  height?: number;
  logoUrl?: string;
}

export class GeminiService {
  private getApiKey(): string {
    return process.env.GEMINI_API_KEY || '';
  }

  /**
   * Generates high-converting social media copy using Google Gemini 2.5 Flash
   */
  public async generateSocialPost(options: SocialPostGenerationOptions): Promise<GeneratedSocialPost> {
    const apiKey = this.getApiKey();
    const promptText = `
You are an expert Social Media & E-commerce Copywriter specializing in viral posts for Facebook Pages, Telegram Channels, and WhatsApp Communities in Bangladesh and global markets.

Generate a highly engaging, persuasive, and conversion-optimized social media post based on:
- Topic / Product: "${options.topic}"
- Target Platform: "${options.platform || 'all'}"
- Tone: "${options.tone || 'promotional'}"
- Primary Language: "${options.language || 'bangla'}"
${options.productName ? `- Product Name: "${options.productName}"` : ''}
${options.productPrice ? `- Regular Price: ৳${options.productPrice}` : ''}
${options.discountPrice ? `- Special Offer Price: ৳${options.discountPrice}` : ''}
${options.brandName ? `- Brand: "${options.brandName}"` : ''}
${options.customInstructions ? `- Special Instructions: "${options.customInstructions}"` : ''}

Output MUST be a strictly valid JSON object with these exact keys:
{
  "headline": "Catchy headline with emojis",
  "caption": "Full formatted post with emojis, bullet points, offer details, delivery info, and order instructions",
  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#Hashtag5"],
  "imagePrompt": "A descriptive prompt in English for creating an eye-catching product banner",
  "shortBroadcastSummary": "1-2 sentence teaser suitable for WhatsApp and Telegram instant push",
  "callToAction": "Direct order instruction e.g. অর্ডার করতে ইনবক্সে মেসেজ দিন বা কল করুন",
  "recommendedBannerTheme": "blue_gradient" | "cyber_purple" | "emerald_glow" | "sunset_orange" | "dark_luxury"
}
`;

    // 1. Check if user explicitly requested OpenAI and provided a key
    const openAiKey = options.openaiApiKey || (options.provider === 'openai' ? options.apiKey : '') || process.env.OPENAI_API_KEY;
    if (options.provider === 'openai' && openAiKey) {
      try {
        const model = options.model || 'gpt-4o';
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model,
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: 'You are an expert Social Media & E-commerce Copywriter. You MUST output strictly valid JSON matching the requested keys.' },
              { role: 'user', content: promptText }
            ]
          })
        });
        if (res.ok) {
          const data: any = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return {
              headline: parsed.headline || '🔥 স্পেশাল ধামাকা অফার!',
              caption: parsed.caption || options.topic,
              hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#SpecialOffer', '#SmartPOS', '#Trending'],
              imagePrompt: parsed.imagePrompt || 'Modern e-commerce promotional product banner with vibrant lighting',
              shortBroadcastSummary: parsed.shortBroadcastSummary || parsed.headline || 'নতুন অফার দেখুন!',
              callToAction: parsed.callToAction || 'অর্ডার করতে ইনবক্স করুন 🛍️',
              recommendedBannerTheme: parsed.recommendedBannerTheme || 'blue_gradient'
            };
          }
        }
      } catch (err: any) {
        console.warn('[OpenAI AI Call Notice]:', err.message);
      }
    }

    // 2. Check if user requested Claude
    const claudeKey = options.claudeApiKey || (options.provider === 'claude' ? options.apiKey : '') || process.env.ANTHROPIC_API_KEY;
    if (options.provider === 'claude' && claudeKey) {
      try {
        const model = options.model || 'claude-3-5-sonnet-20241022';
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': claudeKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model,
            max_tokens: 1500,
            messages: [{ role: 'user', content: promptText + '\nReturn ONLY the JSON object.' }]
          })
        });
        if (res.ok) {
          const data: any = await res.json();
          const textBlock = data.content?.find((c: any) => c.type === 'text')?.text;
          if (textBlock) {
            const jsonMatch = textBlock.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              return {
                headline: parsed.headline || '🔥 স্পেশাল ধামাকা অফার!',
                caption: parsed.caption || options.topic,
                hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#SpecialOffer', '#SmartPOS', '#Trending'],
                imagePrompt: parsed.imagePrompt || 'Modern e-commerce promotional product banner with vibrant lighting',
                shortBroadcastSummary: parsed.shortBroadcastSummary || parsed.headline || 'নতুন অফার দেখুন!',
                callToAction: parsed.callToAction || 'অর্ডার করতে ইনবক্স করুন 🛍️',
                recommendedBannerTheme: parsed.recommendedBannerTheme || 'blue_gradient'
              };
            }
          }
        }
      } catch (err: any) {
        console.warn('[Claude AI Call Notice]:', err.message);
      }
    }

    // 3. Check DeepSeek
    const deepseekKey = options.deepseekApiKey || (options.provider === 'deepseek' ? options.apiKey : '') || process.env.DEEPSEEK_API_KEY;
    if (options.provider === 'deepseek' && deepseekKey) {
      try {
        const model = options.model || 'deepseek-chat';
        const res = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${deepseekKey}`
          },
          body: JSON.stringify({
            model,
            response_format: { type: 'json_object' },
            messages: [{ role: 'user', content: promptText }]
          })
        });
        if (res.ok) {
          const data: any = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return {
              headline: parsed.headline || '🔥 স্পেশাল ধামাকা অফার!',
              caption: parsed.caption || options.topic,
              hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#SpecialOffer', '#SmartPOS', '#Trending'],
              imagePrompt: parsed.imagePrompt || 'Modern e-commerce promotional product banner with vibrant lighting',
              shortBroadcastSummary: parsed.shortBroadcastSummary || parsed.headline || 'নতুন অফার দেখুন!',
              callToAction: parsed.callToAction || 'অর্ডার করতে ইনবক্স করুন 🛍️',
              recommendedBannerTheme: parsed.recommendedBannerTheme || 'blue_gradient'
            };
          }
        }
      } catch (err: any) {
        console.warn('[DeepSeek AI Call Notice]:', err.message);
      }
    }

    // 4. Default / Fallback: Google Gemini 2.5 Flash
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptText,
          config: {
            responseMimeType: 'application/json'
          }
        });

        if (response && response.text) {
          const parsed = JSON.parse(response.text.trim());
          return {
            headline: parsed.headline || '🔥 স্পেশাল ধামাকা অফার!',
            caption: parsed.caption || options.topic,
            hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#SpecialOffer', '#SmartPOS', '#Trending'],
            imagePrompt: parsed.imagePrompt || 'Modern e-commerce promotional product banner with vibrant lighting',
            shortBroadcastSummary: parsed.shortBroadcastSummary || parsed.headline || 'নতুন অফার দেখুন!',
            callToAction: parsed.callToAction || 'অর্ডার করতে ইনবক্স করুন 🛍️',
            recommendedBannerTheme: parsed.recommendedBannerTheme || 'blue_gradient'
          };
        }
      } catch (err: any) {
        console.warn('[Gemini AI] API Call Notice, using intelligent smart fallback:', err.message);
      }
    }

    // High quality rule-based AI copy fallback
    const title = options.productName || options.topic;
    const priceStr = options.discountPrice ? `৳${options.discountPrice}` : (options.productPrice ? `৳${options.productPrice}` : 'আকর্ষণীয় মূল্যে');
    const oldPriceStr = options.discountPrice && options.productPrice ? ` (আগের মূল্য: ৳${options.productPrice})` : '';

    return {
      headline: `🔥 এক্সক্লুসিভ অফার: ${title}! ✨`,
      caption: `🎉 *${title}* এখন পাচ্ছেন বিশেষ অফার মূল্যে!\n\n🏷️ *অফার প্রাইস:* ${priceStr}${oldPriceStr}\n\n✨ *কেন আমাদের প্রোডাক্টটি সেরা?*\n✅ প্রিমিয়াম কোয়ালিটি ও ১০০% অরিজিনাল গ্যারান্টি\n✅ দ্রুততম সময়ে সারাদেশে হোম ডেলিভারি\n✅ পণ্য হাতে পেয়ে চেক করে পেমেন্ট করার সুবিধা (Cash on Delivery)\n\n📦 *ডেলিভারি চার্জ:* ঢাকা সিটিতে ৬০ টাকা, ঢাকার বাইরে ১২০ টাকা।\n\n👉 *অর্ডার করতে:* আপনার নাম, সম্পূর্ণ ঠিকানা ও মোবাইল নম্বর লিখে এখনই ইনবক্সে মেসেজ করুন অথবা কল করুন 🛍️`,
      hashtags: ['#SpecialOffer', '#ExclusiveDeal', '#SmartCommerce', '#BangladeshOnlineShop', '#TrendingNow'],
      imagePrompt: `Professional product advertisement banner for ${title}, studio lighting, ultra-realistic, vibrant 3D elements`,
      shortBroadcastSummary: `🔥 ${title} বিশেষ মূল্যে ${priceStr}-এ উপলব্ধ! এখনই অর্ডার করুন।`,
      callToAction: 'অর্ডার করতে এখনই ইনবক্সে মেসেজ দিন 🛍️',
      recommendedBannerTheme: 'blue_gradient'
    };
  }

  /**
   * Generates a High-Resolution (1200x630) Social Media Marketing Banner using Sharp SVG rendering
   */
  public async generateCreativeBanner(options: BannerGenerationOptions): Promise<{ dataUrl: string; buffer: Buffer }> {
    const width = options.width || 1200;
    const height = options.height || 630;
    const theme = options.theme || 'blue_gradient';
    const brand = options.brandName || 'SMART POS ENTERPRISE';
    const badge = options.badge || '🔥 SPECIAL OFFER';
    const headline = options.headline || 'Exclusive Deal Today';
    const subtitle = options.subtitle || 'Best Quality Guaranteed • Fast Cash on Delivery';
    const price = options.priceTag;
    const oldPrice = options.originalPrice;
    const cta = options.ctaText || 'SHOP NOW 🛍️';

    // Themes Color Palette
    const themes = {
      blue_gradient: {
        bg1: '#1e3a8a',
        bg2: '#0284c7',
        bg3: '#0f172a',
        accent: '#38bdf8',
        badgeBg: '#fbbf24',
        badgeText: '#0f172a',
        cardBg: 'rgba(255, 255, 255, 0.08)'
      },
      cyber_purple: {
        bg1: '#581c87',
        bg2: '#9333ea',
        bg3: '#18181b',
        accent: '#c084fc',
        badgeBg: '#f43f5e',
        badgeText: '#ffffff',
        cardBg: 'rgba(255, 255, 255, 0.08)'
      },
      emerald_glow: {
        bg1: '#064e3b',
        bg2: '#059669',
        bg3: '#022c22',
        accent: '#34d399',
        badgeBg: '#f59e0b',
        badgeText: '#0f172a',
        cardBg: 'rgba(255, 255, 255, 0.08)'
      },
      sunset_orange: {
        bg1: '#7c2d12',
        bg2: '#ea580c',
        bg3: '#1c1917',
        accent: '#fdba74',
        badgeBg: '#facc15',
        badgeText: '#0f172a',
        cardBg: 'rgba(255, 255, 255, 0.08)'
      },
      dark_luxury: {
        bg1: '#18181b',
        bg2: '#27272a',
        bg3: '#09090b',
        accent: '#eab308',
        badgeBg: '#eab308',
        badgeText: '#000000',
        cardBg: 'rgba(255, 255, 255, 0.05)'
      }
    };

    const currentTheme = themes[theme] || themes.blue_gradient;

    // Build SVG Graphic
    const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${currentTheme.bg1}" />
      <stop offset="50%" stop-color="${currentTheme.bg2}" />
      <stop offset="100%" stop-color="${currentTheme.bg3}" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${currentTheme.accent}" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Decorative Modern Shapes -->
  <circle cx="1050" cy="120" r="280" fill="${currentTheme.accent}" opacity="0.15" filter="url(#shadow)" />
  <circle cx="150" cy="550" r="220" fill="${currentTheme.bg2}" opacity="0.25" />
  <rect x="850" y="-80" width="300" height="300" rx="40" transform="rotate(25 850 -80)" fill="${currentTheme.accent}" opacity="0.08" />

  <!-- Glassmorphic Content Card -->
  <rect x="60" y="60" width="${width - 120}" height="${height - 120}" rx="32" fill="${currentTheme.cardBg}" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2" filter="url(#shadow)" />

  <!-- Brand Header -->
  <g transform="translate(110, 125)">
    <circle cx="16" cy="0" r="14" fill="${currentTheme.accent}" />
    <text x="42" y="6" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="900" letter-spacing="3" fill="#ffffff" opacity="0.9">
      ${brand.toUpperCase()}
    </text>
  </g>

  <!-- Badge -->
  <g transform="translate(110, 165)">
    <rect width="220" height="36" rx="18" fill="${currentTheme.badgeBg}" />
    <text x="110" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" letter-spacing="1" fill="${currentTheme.badgeText}" text-anchor="middle">
      ${badge}
    </text>
  </g>

  <!-- Main Headline -->
  <g transform="translate(110, 260)">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="#ffffff" filter="url(#shadow)">
      ${headline.length > 38 ? headline.substring(0, 36) + '...' : headline}
    </text>
  </g>

  <!-- Subtitle -->
  <g transform="translate(110, 310)">
    <text x="0" y="0" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#e2e8f0" opacity="0.9">
      ${subtitle.length > 60 ? subtitle.substring(0, 58) + '...' : subtitle}
    </text>
  </g>

  <!-- Price Tag / Offer Box if available -->
  ${price ? `
  <g transform="translate(110, 380)">
    <rect width="280" height="85" rx="20" fill="rgba(0, 0, 0, 0.35)" stroke="${currentTheme.accent}" stroke-width="2" />
    <text x="24" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1" fill="${currentTheme.accent}">
      SPECIAL OFFER PRICE
    </text>
    <text x="24" y="68" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#ffffff">
      ${price}
    </text>
    ${oldPrice ? `
    <text x="170" y="68" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#94a3b8" text-decoration="line-through">
      ${oldPrice}
    </text>` : ''}
  </g>` : ''}

  <!-- Call to Action Button -->
  <g transform="translate(${price ? 420 : 110}, ${price ? 398 : 380})">
    <rect width="240" height="56" rx="28" fill="${currentTheme.badgeBg}" filter="url(#shadow)" />
    <text x="120" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900" letter-spacing="1" fill="${currentTheme.badgeText}" text-anchor="middle">
      ${cta}
    </text>
  </g>

  <!-- Right Side Visual Icon / Graphic -->
  <g transform="translate(860, 220)">
    <rect width="180" height="180" rx="36" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.2)" stroke-width="2" />
    <circle cx="90" cy="90" r="50" fill="${currentTheme.accent}" opacity="0.2" />
    <text x="90" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="52" text-anchor="middle" fill="#ffffff">
      ⚡
    </text>
    <text x="90" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" letter-spacing="1" text-anchor="middle" fill="${currentTheme.accent}">
      AI POWERED
    </text>
  </g>
</svg>
`;

    const svgBuffer = Buffer.from(svg);
    const pngBuffer = await sharp(svgBuffer).png({ quality: 95 }).toBuffer();
    const dataUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;

    return {
      dataUrl,
      buffer: pngBuffer
    };
  }

  /**
   * Generates both Copywriting and Creative Graphic in a single combined call
   */
  public async generateFullCampaign(options: SocialPostGenerationOptions): Promise<{
    post: GeneratedSocialPost;
    banner: { dataUrl: string; buffer: Buffer };
  }> {
    const post = await this.generateSocialPost(options);

    let bannerDataUrl = '';
    let bannerBuffer: Buffer | null = null;

    // Check if user specifically requested OpenAI DALL-E 3
    const openAiKey = options.openaiApiKey || (options.provider === 'openai' ? options.apiKey : '') || process.env.OPENAI_API_KEY;
    if (options.imageEngine === 'dall-e-3' && openAiKey) {
      try {
        const dallePrompt = `${post.imagePrompt}. High-converting commercial e-commerce advertising photo, clean studio lighting, realistic, 4k resolution.`;
        const dalleRes = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: dallePrompt,
            n: 1,
            size: '1024x1024',
            response_format: 'b64_json'
          })
        });
        if (dalleRes.ok) {
          const dalleData: any = await dalleRes.json();
          const b64 = dalleData.data?.[0]?.b64_json;
          if (b64) {
            bannerDataUrl = `data:image/png;base64,${b64}`;
            bannerBuffer = Buffer.from(b64, 'base64');
          }
        }
      } catch (dalleErr: any) {
        console.warn('[DALL-E 3 Notice, falling back to Sharp SVG]:', dalleErr.message);
      }
    }

    // Default / Built-in Sharp SVG Banner (100% Free - Zero Credit Cost)
    if (!bannerDataUrl || !bannerBuffer) {
      const priceTag = options.discountPrice ? `৳${options.discountPrice}` : (options.productPrice ? `৳${options.productPrice}` : undefined);
      const originalPrice = options.discountPrice && options.productPrice ? `৳${options.productPrice}` : undefined;

      const banner = await this.generateCreativeBanner({
        headline: post.headline.replace(/^[^\w\u0980-\u09FF]+/, ''),
        subtitle: post.shortBroadcastSummary,
        badge: '🔥 EXCLUSIVE OFFER',
        brandName: options.brandName || 'SMART POS',
        priceTag,
        originalPrice,
        ctaText: 'ORDER NOW 🛍️',
        theme: post.recommendedBannerTheme
      });
      bannerDataUrl = banner.dataUrl;
      bannerBuffer = banner.buffer;
    }

    return {
      post,
      banner: {
        dataUrl: bannerDataUrl,
        buffer: bannerBuffer
      }
    };
  }
}

export const geminiService = new GeminiService();
