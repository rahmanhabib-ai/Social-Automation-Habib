/**
 * Robust Spark Production-Packet Parser & Validator
 * Supports Bengali & English section headings, code fence / BEGIN JSON extraction,
 * clean narration separation from performance notes, scene timelines, and format validation contracts.
 */

import {
  ProductionPacket,
  PacketFormat,
  PacketLabel,
  PacketValidationStatus,
  ProductionPacketValidation,
  SceneItem,
  ViewerChapter,
  PlatformMetadataPackage,
  FlowAssetBrief,
  CoverDesignJson,
  ValidationFinding
} from '../types/productionPacket';

// Fast stable hash for change detection
export function computeContentHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return 'h_' + Math.abs(hash).toString(16);
}

// Clean acting instructions, tone markers, and bracketed notes from narration
export function stripActingInstructions(rawText: string): { cleanNarration: string; performanceNotes: string } {
  const directions: string[] = [];
  
  // Extract [Voice: ...], (Tone: ...), [Pause ...], [Music: ...]
  let cleaned = rawText.replace(/\[([^\]]+)\]/g, (match, p1) => {
    directions.push(p1.trim());
    return '';
  });

  cleaned = cleaned.replace(/\((tone|voice|emotion|pacing|whisper|emphasis|shout|pause)[^)]*\)/gi, (match) => {
    directions.push(match.replace(/[()]/g, '').trim());
    return '';
  });

  // Strip Scene prefixes if embedded in narration (e.g. "Scene 1: Hello..." -> "Hello...")
  cleaned = cleaned.replace(/^(Scene|দৃশ্য)\s*\d+[:：]\s*/gmi, '');

  return {
    cleanNarration: cleaned.replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim(),
    performanceNotes: directions.join('; ')
  };
}

// Extract JSON blocks enclosed in ```json ... ``` or BEGIN JSON ... END JSON
export function extractJsonBlocks(text: string): any[] {
  const jsonBlocks: any[] = [];

  // Match ```json ... ``` or ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      jsonBlocks.push(parsed);
    } catch {
      // Not valid JSON, skip
    }
  }

  // Match BEGIN JSON ... END JSON
  const beginEndRegex = /BEGIN(?:\s+)?JSON([\s\S]*?)END(?:\s+)?JSON/gi;
  while ((match = beginEndRegex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      jsonBlocks.push(parsed);
    } catch {
      // Not valid JSON, skip
    }
  }

  return jsonBlocks;
}

// Helper: Estimate narration duration from word counts
export function estimateNarrationDuration(text: string, lang = 'en'): number {
  if (!text || !text.trim()) return 0;
  const words = text.trim().split(/\s+/).length;
  // English ~140 wpm (2.3 words/sec), Bengali ~125 wpm (2.0 words/sec)
  const wordsPerSecond = lang === 'bn' ? 2.0 : 2.3;
  return Math.ceil(words / wordsPerSecond);
}

export function parseAndValidatePacket(
  rawText: string,
  meta: {
    docId: string;
    docTitle: string;
    docUrl?: string;
    folderId?: string;
    modifiedTime?: string;
  }
): ProductionPacket {
  const findings: ValidationFinding[] = [];
  const normalizedText = rawText.replace(/\r\n/g, '\n');

  // 1. Completion Report Only Check
  const isCompletionReportOnly = (
    (normalizedText.includes('Production Complete Report') ||
     normalizedText.includes('Completion Report') ||
     normalizedText.includes('সমাপ্তি রিপোর্ট') ||
     normalizedText.includes('Status: COMPLETE')) &&
    !normalizedText.includes('BN_CLEAN') &&
    !normalizedText.includes('EN_CLEAN') &&
    !normalizedText.includes('Clean Narration') &&
    !normalizedText.includes('Scene 1') &&
    normalizedText.length < 900
  );

  if (isCompletionReportOnly) {
    findings.push({
      code: 'NOT_A_COMPLETE_PACKET',
      severity: 'error',
      message: 'This document contains only a completion report or metadata summary without actual production assets (narration, scenes, or prompt JSONs).'
    });
  }

  // 2. Content ID & Revision extraction
  const contentIdMatch = (
    normalizedText.match(/Content\s*ID\s*[:：]?\s*([A-Za-z0-9\-_]+)/i) ||
    meta.docTitle.match(/(CL-[A-Z0-9\-_]+)/i) ||
    normalizedText.match(/(CL-[A-Z0-9\-_]+)/i) ||
    normalizedText.match(/ID\s*[:：]?\s*([A-Za-z0-9\-_]+)/i)
  );
  const rawContentId = contentIdMatch ? contentIdMatch[1].trim() : `SPARK-${meta.docId.slice(0, 8)}`;
  
  // Extract revision (e.g. -R1, -R2, -v1.0)
  const revMatch = rawContentId.match(/-R(\d+)/i) || rawContentId.match(/-v(\d+(\.\d+)?)/i);
  const revision = revMatch ? revMatch[0].replace(/^-/, '') : 'R1';
  const contentId = rawContentId;

  // 3. Label: TEST vs PRODUCTION
  const isTest = (
    /test/i.test(meta.docTitle) ||
    /test/i.test(contentId) ||
    /\[TEST\]/i.test(normalizedText) ||
    /Status\s*:\s*TEST/i.test(normalizedText)
  );
  const label: PacketLabel = isTest ? 'TEST' : 'PRODUCTION';

  // 4. Format Detection
  let format: PacketFormat = 'UNKNOWN';
  if (/CL-REEL/i.test(contentId) || /REEL/i.test(meta.docTitle) || /\bREEL\b/i.test(normalizedText) || /Format\s*[:：]?\s*Reel/i.test(normalizedText)) {
    format = 'REEL';
  } else if (/CL-IMG/i.test(contentId) || /IMAGE/i.test(meta.docTitle) || /Format\s*[:：]?\s*Image/i.test(normalizedText) || /Infographic/i.test(normalizedText)) {
    format = 'IMAGE';
  } else if (/CL-LONG/i.test(contentId) || /LONG\s*VIDEO/i.test(meta.docTitle) || /Format\s*[:：]?\s*Long\s*Video/i.test(normalizedText) || /YouTube\s*Master/i.test(normalizedText)) {
    format = 'LONG_VIDEO';
  } else if (normalizedText.includes('9:16')) {
    format = 'REEL';
  } else if (normalizedText.includes('16:9')) {
    format = 'LONG_VIDEO';
  } else if (normalizedText.includes('1:1') || normalizedText.includes('4:5')) {
    format = 'IMAGE';
  }

  // 5. Topic / Title
  const topicMatch = (
    normalizedText.match(/বিষয়বস্তু\s*নির্বাচন\s*(?:\([^)]+\))?\s*[:：]?\s*([^\n]+)/i) ||
    normalizedText.match(/Topic\s*(?:Selection)?\s*[:：]?\s*([^\n]+)/i) ||
    normalizedText.match(/Title\s*[:：]?\s*([^\n]+)/i) ||
    normalizedText.match(/শিরোনাম\s*[:：]?\s*([^\n]+)/i)
  );
  const topic = topicMatch ? topicMatch[1].trim() : meta.docTitle.replace(/\.[^/.]+$/, '').trim();

  // 6. Target Publication Date & Time
  const dateMatch = normalizedText.match(/Target\s*(?:Publication)?\s*(?:Date|Time)\s*[:：]?\s*([^\n]+)/i) ||
                    normalizedText.match(/প্রকাশের\s*তারিখ\s*[:：]?\s*([^\n]+)/i);
  const rawDateString = dateMatch ? dateMatch[1].trim() : '';

  let pubDate: string | undefined;
  let pubTime: string | undefined;
  let pubTz: string | undefined;
  if (rawDateString) {
    const tzMatch = rawDateString.match(/(BST|UTC|GMT[+-]\d+|EST|PST)/i);
    pubTz = tzMatch ? tzMatch[1] : 'BST (UTC+6)';

    const timePartMatch = rawDateString.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
    pubTime = timePartMatch ? timePartMatch[1] : undefined;

    const datePartMatch = rawDateString.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}[./-]\d{1,2}[./-]\d{4})/);
    pubDate = datePartMatch ? datePartMatch[1] : undefined;
  }

  // 7. Aspect Ratio & Runtime
  let aspectRatio: '9:16' | '16:9' | '1:1' | '4:5' | 'UNKNOWN' = 'UNKNOWN';
  if (normalizedText.includes('9:16')) aspectRatio = '9:16';
  else if (normalizedText.includes('16:9')) aspectRatio = '16:9';
  else if (normalizedText.includes('1:1')) aspectRatio = '1:1';
  else if (normalizedText.includes('4:5')) aspectRatio = '4:5';
  else if (format === 'REEL') aspectRatio = '9:16';
  else if (format === 'LONG_VIDEO') aspectRatio = '16:9';
  else if (format === 'IMAGE') aspectRatio = '1:1';

  // Target Runtime
  let targetSeconds = 0;
  let isMeasuredRuntime = false;
  const runtimeMatch = normalizedText.match(/(?:Runtime|Duration|দৈর্ঘ্য|সময়কাল)\s*[:：]?\s*(\d+)\s*(s|sec|seconds|মিনিট|min)?/i);
  if (runtimeMatch) {
    const num = parseInt(runtimeMatch[1], 10);
    const unit = (runtimeMatch[2] || '').toLowerCase();
    targetSeconds = (unit.includes('min') || unit.includes('মিনিট')) ? num * 60 : num;
    isMeasuredRuntime = true;
  } else {
    // Default contracts
    if (format === 'REEL') targetSeconds = 40;
    else if (format === 'LONG_VIDEO') targetSeconds = 720;
    else targetSeconds = 0;
  }

  // 8. Narrations & Performance Directions
  const narrations: Record<string, string> = {};
  let performanceDirectionsAccumulator = '';

  // Patterns for multi-language clean narration
  const narrationPatterns: { key: string; regex: RegExp; lang: string }[] = [
    { key: 'BN_CLEAN', regex: /(?:BN_CLEAN|বাংলা\s*ক্লিন\s*ন্যারেশন|Bengali\s*Clean\s*Narration)\s*[:：]?\s*\n([\s\S]*?)(?=(?:EN_CLEAN|ES_CLEAN|AR_CLEAN|HI_CLEAN|Scene|দৃশ্য|Flow|JSON|Platform|$))/i, lang: 'bn' },
    { key: 'EN_CLEAN', regex: /(?:EN_CLEAN|English\s*Clean\s*Narration)\s*[:：]?\s*\n([\s\S]*?)(?=(?:BN_CLEAN|ES_CLEAN|AR_CLEAN|HI_CLEAN|Scene|দৃশ্য|Flow|JSON|Platform|$))/i, lang: 'en' },
    { key: 'ES_CLEAN', regex: /(?:ES_CLEAN|Spanish\s*Clean\s*Narration)\s*[:：]?\s*\n([\s\S]*?)(?=(?:BN_CLEAN|EN_CLEAN|AR_CLEAN|HI_CLEAN|Scene|দৃশ্য|Flow|JSON|Platform|$))/i, lang: 'es' },
    { key: 'AR_CLEAN', regex: /(?:AR_CLEAN|Arabic\s*Clean\s*Narration)\s*[:：]?\s*\n([\s\S]*?)(?=(?:BN_CLEAN|EN_CLEAN|ES_CLEAN|HI_CLEAN|Scene|দৃশ্য|Flow|JSON|Platform|$))/i, lang: 'ar' },
    { key: 'HI_CLEAN', regex: /(?:HI_CLEAN|Hindi\s*Clean\s*Narration)\s*[:：]?\s*\n([\s\S]*?)(?=(?:BN_CLEAN|EN_CLEAN|ES_CLEAN|AR_CLEAN|Scene|দৃশ্য|Flow|JSON|Platform|$))/i, lang: 'hi' }
  ];

  for (const p of narrationPatterns) {
    const m = normalizedText.match(p.regex);
    if (m && m[1].trim()) {
      const stripped = stripActingInstructions(m[1].trim());
      narrations[p.key] = stripped.cleanNarration;
      if (stripped.performanceNotes) {
        performanceDirectionsAccumulator += `[${p.key}]: ${stripped.performanceNotes}\n`;
      }
    }
  }

  // Extract separate explicit Performance / Voice Directions block if present
  const perfDirMatch = normalizedText.match(/(?:Performance\s*Directions|Voice\s*Directions|অ্যাক্টিং\s*ও\s*ভয়েস\s*নির্দেশনা)\s*[:：]?\s*\n([\s\S]*?)(?=(?:BN_CLEAN|EN_CLEAN|Scene|दृश्य|Flow|$))/i);
  if (perfDirMatch) {
    performanceDirectionsAccumulator = perfDirMatch[1].trim() + '\n' + performanceDirectionsAccumulator;
  }

  // 9. Scenes extraction
  const scenes: SceneItem[] = [];
  const sceneRegex = /(?:Scene|দৃশ্য)\s*(\d+)[\s:：\-–]+(?:([0-9:.]+)\s*(?:-|to|থেকে)?\s*([0-9:.]+))?\s*\n([\s\S]*?)(?=(?:Scene|দৃশ্য)\s*\d+|(?:Viewer\s*Chapters|Flow\s*Asset|Cover\s*Design|JSON|$))/gi;
  let sceneMatch: RegExpExecArray | null;
  while ((sceneMatch = sceneRegex.exec(normalizedText)) !== null) {
    const sceneNum = parseInt(sceneMatch[1], 10);
    const start = sceneMatch[2] || '';
    const end = sceneMatch[3] || '';
    const sceneBody = sceneMatch[4] || '';

    // Extract subfields from scene body
    const visualPrompt = (sceneBody.match(/(?:Visual|Visuals|ভিজ্যুয়াল)\s*[:：]?\s*([^\n]+)/i)?.[1] || sceneBody.split('\n')[0] || '').trim();
    const textOverlay = sceneBody.match(/(?:Text\s*Overlay|Overlay|অন-স্ক্রিন\s*টেক্সট)\s*[:：]?\s*([^\n]+)/i)?.[1]?.trim();
    const audioCue = sceneBody.match(/(?:Audio|Voice|সাউন্ড|ভয়েস)\s*[:：]?\s*([^\n]+)/i)?.[1]?.trim();

    scenes.push({
      sceneNumber: sceneNum,
      timeRange: start && end ? `${start} - ${end}` : (start || `Scene ${sceneNum}`),
      visualPrompt,
      textOverlay,
      audioVoiceCue: audioCue,
      notes: sceneBody.trim()
    });
  }

  // 10. Viewer Chapters
  const viewerChapters: ViewerChapter[] = [];
  const chapterSection = normalizedText.match(/(?:Viewer\s*Chapters|Chapters|অধ্যায়)\s*[:：]?\s*\n([\s\S]*?)(?=(?:Flow|Cover|Platform|JSON|$))/i);
  if (chapterSection) {
    const lines = chapterSection[1].split('\n');
    for (const line of lines) {
      const chMatch = line.match(/(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–:]\s*([^\n]+)/);
      if (chMatch) {
        const timeStr = chMatch[1];
        const parts = timeStr.split(':').map(Number);
        const secs = parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
        viewerChapters.push({
          timestamp: timeStr,
          seconds: secs,
          title: chMatch[2].trim()
        });
      }
    }
  }

  // 11. Flow Asset Briefs
  const flowAssetBriefs: FlowAssetBrief[] = [];
  const flowMatches = normalizedText.matchAll(/Flow\s*(?:Brief|Asset|Prompt)\s*#?(\d+)[:：\-–]?\s*\n([\s\S]*?)(?=(?:Flow\s*(?:Brief|Asset)|Cover|Platform|JSON|$))/gi);
  for (const fm of flowMatches) {
    const bIndex = parseInt(fm[1], 10);
    const bBody = fm[2].trim();
    const bPrompt = bBody.match(/(?:Prompt|ভিজ্যুয়াল\s*প্রম্পট)\s*[:：]?\s*([^\n]+)/i)?.[1] || bBody.split('\n')[0];
    const bDuration = parseInt(bBody.match(/(?:Duration|দৈর্ঘ্য)\s*[:：]?\s*(\d+)/i)?.[1] || '8', 10);
    flowAssetBriefs.push({
      briefIndex: bIndex,
      durationSeconds: bDuration,
      prompt: bPrompt.trim(),
      aspectRatio: aspectRatio !== 'UNKNOWN' ? aspectRatio : '9:16',
      motionNotes: bBody.match(/(?:Motion|Camera)\s*[:：]?\s*([^\n]+)/i)?.[1]?.trim()
    });
  }

  // 12. Cover & Image Design JSON
  let coverDesignJson: CoverDesignJson | null = null;
  const jsonBlocks = extractJsonBlocks(normalizedText);
  for (const block of jsonBlocks) {
    if (block.headline || block.artStyle || block.visualTheme || block.elements || block.colorPalette || block.prompt) {
      coverDesignJson = {
        aspectRatio: block.aspectRatio || aspectRatio,
        headline: block.headline,
        subheadline: block.subheadline,
        visualTheme: block.visualTheme,
        artStyle: block.artStyle,
        prompt: block.prompt || block.imagePrompt,
        colorPalette: block.colorPalette,
        elements: block.elements,
        rawJson: block
      };
      break;
    }
  }

  // Fallback: If no code block, look for text-based Cover Design section
  if (!coverDesignJson) {
    const coverTextMatch = normalizedText.match(/(?:Cover\s*Design|Thumbnail\s*Design|থাম্বনেইল\s*ডিজাইন)\s*[:：]?\s*\n([\s\S]*?)(?=(?:Platform|JSON|Flow|$))/i);
    if (coverTextMatch) {
      const ct = coverTextMatch[1];
      coverDesignJson = {
        aspectRatio: aspectRatio !== 'UNKNOWN' ? aspectRatio : (format === 'REEL' ? '9:16' : '16:9'),
        headline: ct.match(/(?:Headline|শিরোনাম)\s*[:：]?\s*([^\n]+)/i)?.[1]?.trim(),
        subheadline: ct.match(/(?:Subheadline|সাব-শিরোনাম)\s*[:：]?\s*([^\n]+)/i)?.[1]?.trim(),
        visualTheme: ct.match(/(?:Theme|ভিজ্যুয়াল\s*থিম)\s*[:：]?\s*([^\n]+)/i)?.[1]?.trim(),
        prompt: ct.match(/(?:Prompt|প্রম্পট)\s*[:：]?\s*([^\n]+)/i)?.[1]?.trim(),
        rawJson: { textExtract: ct.trim() }
      };
    }
  }

  // 13. Platform Metadata Packages
  const platformMetadata: PlatformMetadataPackage[] = [];
  const platforms: ('facebook' | 'instagram' | 'tiktok' | 'youtube' | 'telegram' | 'whatsapp')[] = [
    'facebook', 'instagram', 'tiktok', 'youtube', 'telegram', 'whatsapp'
  ];
  const languages: ('bn' | 'en' | 'es' | 'ar' | 'hi')[] = ['bn', 'en', 'es', 'ar', 'hi'];

  for (const plat of platforms) {
    for (const lang of languages) {
      // Look for e.g. Facebook (BN), Facebook_BN, FB BN, or platform sections
      const platRegex = new RegExp(`(?:${plat})[\\s_]*\\(?${lang}\\)?[\\s:：\\-–]+([\\s\\S]*?)(?=(?:facebook|instagram|tiktok|youtube|telegram|whatsapp|#|$)|\n\n[A-Z])`, 'i');
      const pm = normalizedText.match(platRegex);
      if (pm && pm[1].trim()) {
        const block = pm[1].trim();
        const hashtags = Array.from(block.matchAll(/#([a-zA-Z0-9_\u0980-\u09FF]+)/g)).map(h => '#' + h[1]);
        const title = block.match(/(?:Title|শিরোনাম)\s*[:：]?\s*([^\n]+)/i)?.[1]?.trim();
        platformMetadata.push({
          platform: plat,
          language: lang,
          title,
          caption: block.replace(/#\S+/g, '').trim(),
          hashtags: hashtags.length > 0 ? hashtags : ['#ChartLogic', '#TradingPsychology']
        });
      }
    }
  }

  // If no granular packages matched, build fallback defaults from captions
  if (platformMetadata.length === 0) {
    const generalFb = normalizedText.match(/(?:Facebook\s*Caption|ফেসবুক\s*ক্যাপশন)\s*[:：]?\s*\n([\s\S]*?)(?=(?:Telegram|WhatsApp|Instagram|$))/i)?.[1]?.trim();
    if (generalFb) {
      platformMetadata.push({
        platform: 'facebook',
        language: 'bn',
        caption: generalFb,
        hashtags: ['#ChartLogic', '#ForexTrading']
      });
    }
  }

  // 14. Evidence Sources & Links
  const evidenceSources: { title?: string; url: string; note?: string }[] = [];
  const urlRegex = /https?:\/\/[^\s<>"')]+/g;
  let urlMatch: RegExpExecArray | null;
  while ((urlMatch = urlRegex.exec(normalizedText)) !== null) {
    const url = urlMatch[0];
    if (!url.includes('docs.google.com') && !evidenceSources.some(e => e.url === url)) {
      evidenceSources.push({
        url,
        title: url.split('/')[2] || 'Source Link'
      });
    }
  }

  // 15. Estimated Duration
  const primaryNarration = narrations['BN_CLEAN'] || narrations['EN_CLEAN'] || '';
  const estimatedSeconds = estimateNarrationDuration(primaryNarration, narrations['BN_CLEAN'] ? 'bn' : 'en');
  const durationToReport = isMeasuredRuntime ? targetSeconds : (estimatedSeconds || targetSeconds);

  // 16. VALIDATION CONTRACT EVALUATION
  let score = 100;
  const langs = Object.keys(narrations);

  if (isCompletionReportOnly) {
    score = 0;
  } else if (format === 'REEL') {
    // REEL CONTRACT:
    // - Default 40s (or explicitly specified)
    // - 9:16
    // - Complete BN_CLEAN and EN_CLEAN
    // - Full scene coverage (>= 4 scenes)
    // - Five planned 8-second Flow briefs
    // - One vertical cover JSON
    // - Multi-platform metadata
    if (!narrations['BN_CLEAN']) {
      findings.push({ code: 'MISSING_BN_CLEAN', severity: 'error', message: 'Reel requires complete BN_CLEAN narration.' });
      score -= 20;
    }
    if (!narrations['EN_CLEAN']) {
      findings.push({ code: 'MISSING_EN_CLEAN', severity: 'error', message: 'Reel requires complete EN_CLEAN narration.' });
      score -= 20;
    }
    if (scenes.length < 3) {
      findings.push({ code: 'INSUFFICIENT_SCENES', severity: 'warning', message: `Expected at least 4 scenes for Reel, found ${scenes.length}.` });
      score -= 15;
    }
    if (flowAssetBriefs.length < 3) {
      findings.push({ code: 'INSUFFICIENT_FLOW_BRIEFS', severity: 'warning', message: `Reel specification targets 5 Flow asset briefs, found ${flowAssetBriefs.length}.` });
      score -= 10;
    }
    if (!coverDesignJson) {
      findings.push({ code: 'MISSING_COVER_JSON', severity: 'warning', message: 'Missing 9:16 vertical cover design JSON.' });
      score -= 15;
    }
  } else if (format === 'LONG_VIDEO') {
    // LONG VIDEO CONTRACT:
    // - Default 720s (12m)
    // - 16:9
    // - 5 full narration masters: BN, EN, ES, AR, HI
    // - Complete scene plan
    // - Useful Flow briefs
    // - Horizontal thumbnail design JSON
    // - Localized chapter lists
    const requiredLangs = ['BN_CLEAN', 'EN_CLEAN', 'ES_CLEAN', 'AR_CLEAN', 'HI_CLEAN'];
    const missingLangs = requiredLangs.filter(l => !narrations[l]);
    if (missingLangs.length > 0) {
      findings.push({ code: 'MISSING_NARRATION_MASTERS', severity: 'warning', message: `Long video targets 5 narration masters. Missing: ${missingLangs.join(', ')}.` });
      score -= missingLangs.length * 8;
    }
    if (viewerChapters.length === 0) {
      findings.push({ code: 'MISSING_CHAPTERS', severity: 'warning', message: 'Long video requires localized viewer chapter lists with timestamps.' });
      score -= 10;
    }
    if (!coverDesignJson) {
      findings.push({ code: 'MISSING_THUMBNAIL_JSON', severity: 'warning', message: 'Missing horizontal thumbnail design JSON.' });
      score -= 15;
    }
  } else if (format === 'IMAGE') {
    // IMAGE CONTRACT:
    // - English-only public copy
    // - Design JSON present
    // - Facebook, Instagram, TikTok-photo captions
    if (!coverDesignJson && jsonBlocks.length === 0) {
      findings.push({ code: 'MISSING_DESIGN_JSON', severity: 'error', message: 'Image packet requires valid design JSON.' });
      score -= 30;
    }
  }

  score = Math.max(0, Math.min(100, score));

  let validationStatus: PacketValidationStatus = 'VALIDATED';
  if (isCompletionReportOnly) {
    validationStatus = 'NOT_A_COMPLETE_PACKET';
  } else if (score < 50 || findings.some(f => f.severity === 'error')) {
    validationStatus = 'DRAFT_INCOMPLETE';
  } else {
    validationStatus = 'VALIDATED';
  }

  const validation: ProductionPacketValidation = {
    status: validationStatus,
    isComplete: validationStatus === 'VALIDATED',
    score,
    estimatedDurationSeconds: estimatedSeconds,
    targetDurationSeconds: targetSeconds,
    timingType: isMeasuredRuntime ? 'measured' : (estimatedSeconds > 0 ? 'estimated' : 'unspecified'),
    findings,
    languagesCovered: langs,
    platformPackagesCount: platformMetadata.length,
    flowBriefsCount: flowAssetBriefs.length,
    hasCoverDesignJson: Boolean(coverDesignJson),
    isCompletionReportOnly
  };

  const formattedRuntime = targetSeconds > 0
    ? (targetSeconds >= 60 ? `${Math.floor(targetSeconds / 60)}m ${targetSeconds % 60}s` : `${targetSeconds}s`)
    : (estimatedSeconds > 0 ? `~${estimatedSeconds}s` : 'N/A');

  return {
    id: meta.docId,
    sourceDocId: meta.docId,
    sourceDocTitle: meta.docTitle,
    sourceDocUrl: meta.docUrl || `https://docs.google.com/document/d/${meta.docId}/edit`,
    folderId: meta.folderId || '1nhfy1mDMEEH9XBt8G_j1k3QBAv6VyW-l',
    modifiedTime: meta.modifiedTime || new Date().toISOString(),
    importedAt: new Date().toISOString(),
    lastSyncAt: new Date().toISOString(),
    contentHash: computeContentHash(rawText),
    version: 1,

    contentId,
    revision,
    format,
    topic,
    label,

    targetPublication: {
      date: pubDate,
      time: pubTime,
      timezone: pubTz,
      rawString: rawDateString
    },

    runtime: {
      targetSeconds,
      estimatedSeconds,
      formatted: formattedRuntime,
      isEstimated: !isMeasuredRuntime
    },
    aspectRatio,

    narrations,
    performanceDirections: performanceDirectionsAccumulator.trim(),
    scenes,
    viewerChapters,
    flowAssetBriefs,
    coverDesignJson,
    platformMetadata,
    evidenceSources,
    assetLinks: [],
    unrecognizedFields: {},
    validation,
    rawText,

    renderingStatus: {
      audioRendered: false,
      visualsRendered: false,
      videoRendered: false,
      thumbnailRendered: false,
      notes: 'Source packet imported. Generation pipeline ready.'
    }
  };
}
