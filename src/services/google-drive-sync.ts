/**
 * Google Drive & Docs Spark Production Synchronization Service
 * Reads ChartLogic & Spark production briefs from Google Drive/Docs/Sheets,
 * extracts structured fields (Content ID, Caption, Script, Schedule Time, Hashtags),
 * and dispatches them to Social Post Scheduler & Channels.
 */

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface ParsedProductionPacket {
  contentId: string;
  title: string;
  topic: string;
  contextAndDecisions: string;
  targetDate?: string;
  targetTime?: string;
  scheduledIso?: string;
  facebookCaption: string;
  telegramCaption: string;
  whatsAppCaption: string;
  hashtags: string[];
  callToAction: string;
  videoScript?: string;
  rawText: string;
  bannerPrompt?: string;
  bannerImageUrl?: string;
}

// Client-Side Google Identity Services Token Manager
export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/documents.readonly'
].join(' ');

let tokenClient: any = null;

export function initGoogleTokenClient(clientId: string, onTokenReceived: (tokenResponse: any) => void) {
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPES,
      callback: onTokenReceived,
    });
    return tokenClient;
  }
  return null;
}

export function requestGoogleAccessToken() {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    console.warn('Google Token Client not initialized yet.');
  }
}

// Fetch files from Google Drive
export async function fetchDriveFiles(accessToken: string, folderId?: string): Promise<GoogleDriveFile[]> {
  try {
    let query = "trashed = false and (mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'text/plain' or mimeType = 'application/vnd.google-apps.folder')";
    if (folderId) {
      query = `'${folderId}' in parents and ${query}`;
    }

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,webViewLink,iconLink)&pageSize=30`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'গুগল ড্রাইভ ফাইল ফেচ করতে ব্যর্থ হয়েছে');
    }

    const data = await res.json();
    return data.files || [];
  } catch (error: any) {
    console.error('fetchDriveFiles error:', error);
    throw error;
  }
}

// Fetch and extract plain text from Google Doc
export async function fetchDocContent(accessToken: string, docId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://docs.googleapis.com/v1/documents/${docId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'গুগল ডক রিড করতে ব্যর্থ হয়েছে');
    }

    const data = await res.json();
    let fullText = '';

    if (data.body && data.body.content) {
      for (const element of data.body.content) {
        if (element.paragraph && element.paragraph.elements) {
          for (const pe of element.paragraph.elements) {
            if (pe.textRun && pe.textRun.content) {
              fullText += pe.textRun.content;
            }
          }
        } else if (element.table) {
          // Extract table texts
          for (const row of element.table.tableRows || []) {
            for (const cell of row.tableCells || []) {
              for (const content of cell.content || []) {
                if (content.paragraph) {
                  for (const pe of content.paragraph.elements || []) {
                    if (pe.textRun?.content) fullText += pe.textRun.content + ' ';
                  }
                }
              }
            }
            fullText += '\n';
          }
        }
      }
    }

    return fullText.trim();
  } catch (error: any) {
    console.error('fetchDocContent error:', error);
    throw error;
  }
}

// Smart Parser for Spark / ChartLogic production briefs
export function parseSparkProductionText(rawText: string): ParsedProductionPacket {
  // Extract Content ID (e.g. CL-REEL-20260926-R3 or similar)
  const idMatch = rawText.match(/Content\s*ID\s*[:：]?\s*([A-Za-z0-9\-_]+)/i) ||
                  rawText.match(/(CL-[A-Z0-9\-_]+)/i) ||
                  rawText.match(/ID\s*[:：]?\s*([A-Za-z0-9\-_]+)/i);
  const contentId = idMatch ? idMatch[1].trim() : `SPARK-${Date.now().toString().slice(-6)}`;

  // Extract Topic / Title
  const topicMatch = rawText.match(/বিষয়বস্তু\s*নির্বাচন\s*\(([^)]+)\)\s*[:：]?\s*([^\n]+)/i) ||
                     rawText.match(/Topic\s*Selection\s*[:：]?\s*([^\n]+)/i) ||
                     rawText.match(/Topic\s*[:：]?\s*([^\n]+)/i);
  const topic = topicMatch ? (topicMatch[2] || topicMatch[1]).trim() : 'ChartLogic Trading Psychology & Strategy';

  // Extract Decision / Context
  const contextMatch = rawText.match(/সিদ্ধান্ত\s*ও\s*পটভূমি\s*ব্যাখ্যা[^\n]*\n([\s\S]*?)(?=১\.|ক্রিয়েটিভ\s*ব্রিফ|বিষয়বস্তু|$)/i);
  const contextAndDecisions = contextMatch ? contextMatch[1].trim() : '';

  // Extract Schedule Date & Time
  const dateMatch = rawText.match(/Target\s*Publication\s*Date\s*&\s*Time\s*[:：]?\s*([^\n]+)/i) ||
                    rawText.match(/Publication\s*Date\s*[:：]?\s*([^\n]+)/i);
  const targetDateStr = dateMatch ? dateMatch[1].trim() : '';

  // Build clean Social Media Captions
  // 1. Facebook Formatted Post
  let facebookCaption = `📊 ${topic}\n\n`;
  if (contextAndDecisions) {
    const cleanContext = contextAndDecisions
      .replace(/[•*-]/g, '▪️')
      .split('\n')
      .filter(l => l.trim().length > 0)
      .slice(0, 5)
      .join('\n\n');
    facebookCaption += `${cleanContext}\n\n`;
  } else {
    facebookCaption += `${rawText.slice(0, 400)}...\n\n`;
  }
  facebookCaption += `📌 মূল শিক্ষা: ডিসিপ্লিনড ট্রেডিং ও সঠিক রিস্ক-টু-রিওয়ার্ডই দীর্ঘমেয়াদে ধারাবাহিক প্রফিটের চাবিকাঠি।\n\n`;
  facebookCaption += `💬 আপনার মতামত বা প্রশ্ন নিচে কমেন্টে জানান!\n`;
  facebookCaption += `#ChartLogic #TradingPsychology #ForexTrading #GoldTrading #RiskManagement #SmartMoneyConcept`;

  // 2. Telegram Broadcast Formatted Post
  let telegramCaption = `🚨 <b>${topic}</b>\n\n`;
  telegramCaption += `<i>${contextAndDecisions ? contextAndDecisions.slice(0, 300) : rawText.slice(0, 300)}...</i>\n\n`;
  telegramCaption += `⚡ <b>Key Insight:</b> হাই উইন-রেট নয়, বরং ১:৩/১:৪ R:R নিশ্চিত করাই প্রফেশনাল ট্রেডারদের সিক্রেট।\n\n`;
  telegramCaption += `🔗 ChartLogic Official VIP Community | #Forex #XAUUSD`;

  // 3. WhatsApp Formatted Post
  let whatsAppCaption = `*ChartLogic Trading Insights* 📈\n\n*${topic}*\n\n`;
  whatsAppCaption += `${contextAndDecisions ? contextAndDecisions.slice(0, 250) : rawText.slice(0, 250)}...\n\n`;
  whatsAppCaption += `👉 বিস্তারিত জানতে ও রেগুলার ট্রেডিং আপডেট পেতে আমাদের চ্যানেল ফলো করুন।`;

  const hashtags = ['#ChartLogic', '#TradingPsychology', '#ForexTrading', '#XAUUSD', '#RiskReward', '#SmartTrading'];
  const callToAction = 'কমেন্ট বক্সে আপনার ট্রেডিং স্ট্র্যাটেজি শেয়ার করুন এবং ফলো দিয়ে সাথেই থাকুন!';

  return {
    contentId,
    title: topic,
    topic,
    contextAndDecisions,
    targetDate: targetDateStr,
    facebookCaption,
    telegramCaption,
    whatsAppCaption,
    hashtags,
    callToAction,
    rawText
  };
}
