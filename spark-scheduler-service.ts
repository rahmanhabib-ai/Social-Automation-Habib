import fs from 'fs';
import path from 'path';
import { metaOAuthService } from './meta-service';
import { geminiService, GeneratedSocialPost } from './gemini-service';
import { saveDbSparkCampaign } from './src/db/system.ts';

export interface SparkCampaign {
  id: string;
  name: string;
  topicPrompt: string;
  tone: 'promotional' | 'urgent_deal' | 'storytelling' | 'casual';
  language: 'bangla' | 'english' | 'banglish';
  generateBanner: boolean;
  bannerTheme: 'blue_gradient' | 'cyber_purple' | 'emerald_glow' | 'sunset_orange' | 'dark_luxury';
  productPrice?: number;
  discountPrice?: number;
  brandName?: string;
  scheduleType: 'daily' | 'interval_hours' | 'once';
  times: string[]; // e.g. ["09:00", "15:00", "20:00"]
  intervalHours?: number; // e.g. every 6 hours
  specificDateTime?: string;
  targetPlatforms: {
    facebookPages: string[]; // Page IDs
    facebookGroups: string[]; // Group IDs
    telegramChats: string[]; // Telegram Chat/Channel IDs
    whatsappTargets: string[]; // WhatsApp JIDs (channels/groups)
  };
  isActive: boolean;
  totalRuns: number;
  createdAt: string;
  lastRunAt?: string;
  nextRunAt?: string;
  lastLogs?: SparkExecutionLog[];
}

export interface SparkExecutionLog {
  id: string;
  campaignId: string;
  campaignName: string;
  timestamp: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  generatedHeadline: string;
  generatedCaption: string;
  hasBanner: boolean;
  results: Array<{
    platform: 'facebook_page' | 'facebook_group' | 'telegram' | 'whatsapp';
    targetId: string;
    targetName?: string;
    status: 'ok' | 'failed';
    error?: string;
    postId?: string;
    url?: string;
  }>;
}

const STORAGE_PATH = path.join(process.cwd(), 'spark_campaigns.json');

function loadCampaigns(): SparkCampaign[] {
  try {
    if (fs.existsSync(STORAGE_PATH)) {
      const raw = fs.readFileSync(STORAGE_PATH, 'utf-8');
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    }
  } catch (e) {
    console.warn('[Spark Storage] Error loading campaigns:', e);
  }

  // Pre-seed with default intelligent campaigns if empty
  const defaultCampaigns: SparkCampaign[] = [
    {
      id: 'spark_daily_deal',
      name: '🔥 ডেইলি ফ্ল্যাশ সেলস ও অফার বুস্টার',
      topicPrompt: 'আজকের স্পেশাল ধামাকা ডিসকাউন্ট অফার ও ক্যাশ অন ডেলিভারি সুবিধা',
      tone: 'urgent_deal',
      language: 'bangla',
      generateBanner: true,
      bannerTheme: 'blue_gradient',
      brandName: 'SMART POS',
      scheduleType: 'daily',
      times: ['10:00', '18:00'],
      targetPlatforms: {
        facebookPages: [],
        facebookGroups: [],
        telegramChats: [],
        whatsappTargets: []
      },
      isActive: false,
      totalRuns: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: 'spark_product_showcase',
      name: '✨ প্রিমিয়াম প্রোডাক্ট হাইলাইট ও ফিচারস',
      topicPrompt: 'সেরা মানের নতুন ট্রেন্ডিং প্রোডাক্ট কালেকশন ও ১০০% অরিজিনাল গ্যারান্টি',
      tone: 'promotional',
      language: 'bangla',
      generateBanner: true,
      bannerTheme: 'dark_luxury',
      brandName: 'SMART POS',
      scheduleType: 'daily',
      times: ['14:00'],
      targetPlatforms: {
        facebookPages: [],
        facebookGroups: [],
        telegramChats: [],
        whatsappTargets: []
      },
      isActive: false,
      totalRuns: 0,
      createdAt: new Date().toISOString()
    }
  ];

  saveCampaigns(defaultCampaigns);
  return defaultCampaigns;
}

function saveCampaigns(campaigns: SparkCampaign[]) {
  try {
    fs.writeFileSync(STORAGE_PATH, JSON.stringify(campaigns, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Spark Storage] Failed to save campaigns:', e);
  }

  // Persist to Cloud SQL PostgreSQL
  (async () => {
    try {
      for (const c of campaigns) {
        await saveDbSparkCampaign({
          id: c.id,
          name: c.name,
          channel: Object.keys(c.targetPlatforms || {}).join(','),
          status: c.isActive ? 'active' : 'inactive',
          content: c.topicPrompt || '',
          targets: c.targetPlatforms,
          scheduleTime: c.times?.join(',') || c.specificDateTime || null
        });
      }
    } catch (e) {
      console.warn('[Cloud SQL] Failed syncing spark campaigns to DB:', e);
    }
  })();
}

export class SparkSchedulerService {
  private campaigns: SparkCampaign[] = [];
  private executionHistory: SparkExecutionLog[] = [];
  private isProcessing = false;
  private timer: NodeJS.Timeout | null = null;
  
  // Pluggable publishers for WhatsApp and Telegram
  private whatsappSender: ((targetJid: string, content: any) => Promise<any>) | null = null;
  private telegramSender: ((chatId: string, text: string, imageUrl?: string) => Promise<any>) | null = null;

  constructor() {
    this.campaigns = loadCampaigns();
    this.recalculateNextRuns();
    this.startWorker();
  }

  public registerPublishers(
    whatsapp: (targetJid: string, content: any) => Promise<any>,
    telegram: (chatId: string, text: string, imageUrl?: string) => Promise<any>
  ) {
    this.whatsappSender = whatsapp;
    this.telegramSender = telegram;
  }

  private startWorker() {
    if (this.timer) clearInterval(this.timer);
    // Tick every 30 seconds
    this.timer = setInterval(() => {
      this.checkAndExecuteScheduledCampaigns().catch(e => {
        console.error('[Spark Scheduler Tick Error]:', e);
      });
    }, 30000);
  }

  private recalculateNextRuns() {
    const now = new Date();
    for (const c of this.campaigns) {
      if (!c.isActive) {
        c.nextRunAt = undefined;
        continue;
      }

      if (c.scheduleType === 'daily' && Array.isArray(c.times) && c.times.length > 0) {
        // Find next upcoming time today or tomorrow
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentMinsTotal = currentHours * 60 + currentMinutes;

        let nextTimeStr = c.times
          .map(t => {
            const [h, m] = t.split(':').map(Number);
            return { timeStr: t, mins: h * 60 + m };
          })
          .sort((a, b) => a.mins - b.mins)
          .find(t => t.mins > currentMinsTotal);

        if (nextTimeStr) {
          const [h, m] = nextTimeStr.timeStr.split(':').map(Number);
          const nextDate = new Date(now);
          nextDate.setHours(h, m, 0, 0);
          c.nextRunAt = nextDate.toISOString();
        } else {
          // Wrap to first time tomorrow
          const first = c.times[0];
          const [h, m] = first.split(':').map(Number);
          const nextDate = new Date(now);
          nextDate.setDate(nextDate.getDate() + 1);
          nextDate.setHours(h, m, 0, 0);
          c.nextRunAt = nextDate.toISOString();
        }
      } else if (c.scheduleType === 'interval_hours') {
        const intervalMs = (c.intervalHours || 6) * 3600000;
        const last = c.lastRunAt ? new Date(c.lastRunAt).getTime() : now.getTime();
        c.nextRunAt = new Date(last + intervalMs).toISOString();
      }
    }
  }

  /**
   * Main Scheduler loop
   */
  public async checkAndExecuteScheduledCampaigns() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      for (const campaign of this.campaigns) {
        if (!campaign.isActive) continue;

        let shouldRun = false;
        if (campaign.nextRunAt) {
          const nextDate = new Date(campaign.nextRunAt);
          if (now.getTime() >= nextDate.getTime() - 5000) {
            shouldRun = true;
          }
        }

        if (shouldRun) {
          console.log(`[Spark Scheduler] Executing scheduled campaign: "${campaign.name}" (${campaign.id})`);
          await this.executeCampaign(campaign.id);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Executes a campaign: Generates AI copy & banner, then publishes across all targets
   */
  public async executeCampaign(campaignId: string): Promise<SparkExecutionLog> {
    const campaign = this.campaigns.find(c => c.id === campaignId);
    if (!campaign) {
      throw new Error(`Campaign with ID ${campaignId} not found.`);
    }

    console.log(`[Spark AI Execution Start]: Generating content for "${campaign.name}"...`);

    let generated: { post: GeneratedSocialPost; banner?: { dataUrl: string; buffer: Buffer } };
    
    if (campaign.generateBanner) {
      generated = await geminiService.generateFullCampaign({
        topic: campaign.topicPrompt,
        tone: campaign.tone,
        language: campaign.language,
        brandName: campaign.brandName || 'SMART POS',
        productPrice: campaign.productPrice,
        discountPrice: campaign.discountPrice
      });
    } else {
      const post = await geminiService.generateSocialPost({
        topic: campaign.topicPrompt,
        tone: campaign.tone,
        language: campaign.language,
        brandName: campaign.brandName || 'SMART POS',
        productPrice: campaign.productPrice,
        discountPrice: campaign.discountPrice
      });
      generated = { post };
    }

    const log: SparkExecutionLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      campaignId: campaign.id,
      campaignName: campaign.name,
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
      generatedHeadline: generated.post.headline,
      generatedCaption: generated.post.caption,
      hasBanner: Boolean(generated.banner),
      results: []
    };

    const targets = campaign.targetPlatforms || { facebookPages: [], facebookGroups: [], telegramChats: [], whatsappTargets: [] };
    const bannerDataUrl = generated.banner?.dataUrl;
    const bannerBuffer = generated.banner?.buffer;

    // 1. Publish to Facebook Pages
    if (Array.isArray(targets.facebookPages)) {
      for (const pageId of targets.facebookPages) {
        try {
          const res = await metaOAuthService.publishToPage(pageId, {
            message: generated.post.caption,
            imageUrl: bannerDataUrl,
            imageBuffer: bannerBuffer
          });
          log.results.push({
            platform: 'facebook_page',
            targetId: pageId,
            status: 'ok',
            postId: res.postId,
            url: res.permalink
          });
        } catch (err: any) {
          log.results.push({
            platform: 'facebook_page',
            targetId: pageId,
            status: 'failed',
            error: err.message
          });
        }
      }
    }

    // 2. Publish to Facebook Groups
    if (Array.isArray(targets.facebookGroups)) {
      for (const groupId of targets.facebookGroups) {
        try {
          const res = await metaOAuthService.publishToGroup(groupId, {
            message: generated.post.caption,
            imageUrl: bannerDataUrl
          });
          log.results.push({
            platform: 'facebook_group',
            targetId: groupId,
            status: 'ok',
            postId: res.postId
          });
        } catch (err: any) {
          log.results.push({
            platform: 'facebook_group',
            targetId: groupId,
            status: 'failed',
            error: err.message
          });
        }
      }
    }

    // 3. Publish to Telegram Chats / Channels
    if (Array.isArray(targets.telegramChats) && this.telegramSender) {
      for (const chatId of targets.telegramChats) {
        try {
          await this.telegramSender(chatId, generated.post.caption, bannerDataUrl);
          log.results.push({
            platform: 'telegram',
            targetId: chatId,
            status: 'ok'
          });
        } catch (err: any) {
          log.results.push({
            platform: 'telegram',
            targetId: chatId,
            status: 'failed',
            error: err.message
          });
        }
      }
    }

    // 4. Publish to WhatsApp Channels / Groups
    if (Array.isArray(targets.whatsappTargets) && this.whatsappSender) {
      for (const waJid of targets.whatsappTargets) {
        try {
          const content = bannerBuffer
            ? { image: bannerBuffer, caption: generated.post.caption }
            : { text: generated.post.caption };
          await this.whatsappSender(waJid, content);
          log.results.push({
            platform: 'whatsapp',
            targetId: waJid,
            status: 'ok'
          });
        } catch (err: any) {
          log.results.push({
            platform: 'whatsapp',
            targetId: waJid,
            status: 'failed',
            error: err.message
          });
        }
      }
    }

    // Calculate overall status
    const failedCount = log.results.filter(r => r.status === 'failed').length;
    const okCount = log.results.filter(r => r.status === 'ok').length;
    if (log.results.length === 0) {
      log.status = 'SUCCESS';
    } else if (failedCount === 0) {
      log.status = 'SUCCESS';
    } else if (okCount > 0) {
      log.status = 'PARTIAL';
    } else {
      log.status = 'FAILED';
    }

    // Update campaign metrics
    campaign.totalRuns = (campaign.totalRuns || 0) + 1;
    campaign.lastRunAt = new Date().toISOString();
    if (!campaign.lastLogs) campaign.lastLogs = [];
    campaign.lastLogs.unshift(log);
    if (campaign.lastLogs.length > 20) campaign.lastLogs = campaign.lastLogs.slice(0, 20);

    this.executionHistory.unshift(log);
    if (this.executionHistory.length > 100) this.executionHistory = this.executionHistory.slice(0, 100);

    this.recalculateNextRuns();
    saveCampaigns(this.campaigns);

    return log;
  }

  // CRUD Operations
  public getAllCampaigns(): SparkCampaign[] {
    return this.campaigns;
  }

  public getCampaignById(id: string): SparkCampaign | undefined {
    return this.campaigns.find(c => c.id === id);
  }

  public createCampaign(data: Partial<SparkCampaign>): SparkCampaign {
    const newCampaign: SparkCampaign = {
      id: 'spark_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: data.name || 'নতুন অটোমেশন ক্যাম্পেইন',
      topicPrompt: data.topicPrompt || 'স্পেশাল প্রোডাক্ট অফার',
      tone: data.tone || 'promotional',
      language: data.language || 'bangla',
      generateBanner: data.generateBanner ?? true,
      bannerTheme: data.bannerTheme || 'blue_gradient',
      productPrice: data.productPrice,
      discountPrice: data.discountPrice,
      brandName: data.brandName || 'SMART POS',
      scheduleType: data.scheduleType || 'daily',
      times: Array.isArray(data.times) && data.times.length > 0 ? data.times : ['10:00'],
      intervalHours: data.intervalHours,
      targetPlatforms: data.targetPlatforms || {
        facebookPages: [],
        facebookGroups: [],
        telegramChats: [],
        whatsappTargets: []
      },
      isActive: data.isActive ?? true,
      totalRuns: 0,
      createdAt: new Date().toISOString()
    };

    this.campaigns.unshift(newCampaign);
    this.recalculateNextRuns();
    saveCampaigns(this.campaigns);
    return newCampaign;
  }

  public updateCampaign(id: string, updates: Partial<SparkCampaign>): SparkCampaign | null {
    const idx = this.campaigns.findIndex(c => c.id === id);
    if (idx === -1) return null;

    this.campaigns[idx] = {
      ...this.campaigns[idx],
      ...updates
    };

    this.recalculateNextRuns();
    saveCampaigns(this.campaigns);
    return this.campaigns[idx];
  }

  public toggleCampaign(id: string, isActive?: boolean): SparkCampaign | null {
    const campaign = this.campaigns.find(c => c.id === id);
    if (!campaign) return null;

    campaign.isActive = typeof isActive === 'boolean' ? isActive : !campaign.isActive;
    this.recalculateNextRuns();
    saveCampaigns(this.campaigns);
    return campaign;
  }

  public deleteCampaign(id: string): boolean {
    const initialLen = this.campaigns.length;
    this.campaigns = this.campaigns.filter(c => c.id !== id);
    if (this.campaigns.length !== initialLen) {
      saveCampaigns(this.campaigns);
      return true;
    }
    return false;
  }

  public getLogs(): SparkExecutionLog[] {
    return this.executionHistory;
  }
}

export const sparkSchedulerService = new SparkSchedulerService();
