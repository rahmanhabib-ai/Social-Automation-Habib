export type SocialPlatformId = 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'telegram' | 'whatsapp';

export interface SocialPlatformInfo {
  id: SocialPlatformId;
  name: string;
  bnName: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  postTypes: string[];
}

export const SOCIAL_PLATFORMS: Record<SocialPlatformId, SocialPlatformInfo> = {
  facebook: {
    id: 'facebook',
    name: 'Facebook Page',
    bnName: 'ফেসবুক পেজ',
    icon: 'Facebook',
    color: '#1877F2',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800',
    postTypes: ['Feed Post', 'Photo Album', 'Video / Reel']
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram Business',
    bnName: 'ইনস্টাগ্রাম',
    icon: 'Instagram',
    color: '#E4405F',
    bgColor: 'bg-pink-50 dark:bg-pink-950/40',
    borderColor: 'border-pink-200 dark:border-pink-800',
    postTypes: ['Photo Post', 'Carousel Slideshow', 'Reel']
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok Business',
    bnName: 'টিকটক',
    icon: 'Music2',
    color: '#000000',
    bgColor: 'bg-slate-50 dark:bg-slate-900',
    borderColor: 'border-slate-300 dark:border-slate-700',
    postTypes: ['Video Post', 'Photo Slideshow']
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Channel',
    bnName: 'ইউটিউব',
    icon: 'Youtube',
    color: '#FF0000',
    bgColor: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800',
    postTypes: ['Community Post', 'Shorts / Video']
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram Channel',
    bnName: 'টেলিগ্রাম',
    icon: 'Send',
    color: '#229ED9',
    bgColor: 'bg-sky-50 dark:bg-sky-950/40',
    borderColor: 'border-sky-200 dark:border-sky-800',
    postTypes: ['Broadcast Post', 'Photo & Caption', 'Product Alert']
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Channel',
    bnName: 'হোয়াটসঅ্যাপ চ্যানেল',
    icon: 'MessageCircle',
    color: '#25D366',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    postTypes: ['Channel Broadcast', 'Catalogue Alert']
  }
};

export interface SocialPost {
  id: string;
  content: string;
  mediaUrls?: string[];
  mediaUrl?: string; // backwards compatibility
  mediaType: 'none' | 'image' | 'carousel' | 'video';
  platforms: SocialPlatformId[];
  platformSettings?: Record<string, { postType?: string; customHeadline?: string }>;
  scheduledAt?: string;
  publishedAt?: string;
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  createdAt: string;
  productId?: string;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
  results?: Record<string, { status: 'success' | 'failed' | 'pending'; link?: string; message?: string }>;
}

export interface CommentAutomationRule {
  id: string;
  name: string;
  platforms: SocialPlatformId[];
  targetPostId?: string; // specific post ID or 'all'
  keywords: string[];
  matchType: 'contains' | 'exact';
  publicReplies: string[]; // rotating public comment replies
  sendPrivateDm: boolean;
  privateDmMessage: string;
  includeProductCard: boolean;
  productId?: string;
  productName?: string;
  productPrice?: number;
  productImage?: string;
  checkoutUrl?: string;
  couponCode?: string;
  isActive: boolean;
  createdAt: string;
  triggerCount: number;
}

export interface CommentExecutionLog {
  id: string;
  ruleId: string;
  ruleName: string;
  platform: SocialPlatformId;
  postTitleOrId: string;
  commenterName: string;
  commenterHandle?: string;
  commentText: string;
  publicReplySent: string;
  privateDmStatus: 'sent' | 'failed' | 'disabled';
  privateDmMessage?: string;
  timestamp: string;
}

export interface OmniMessage {
  id: string;
  conversationId: string;
  sender: 'customer' | 'agent' | 'ai_bot';
  senderName: string;
  senderPhone?: string;
  chatType?: 'direct' | 'group' | 'channel';
  text: string;
  timestamp: string;
  isAiGenerated?: boolean;
  intent?: string;
  mediaUrl?: string;
}

export interface OmniConversation {
  id: string;
  customerName: string;
  customerPhone?: string;
  customerHandle?: string;
  customerAvatar?: string;
  chatType?: 'direct' | 'group' | 'channel';
  groupTitle?: string;
  platform: SocialPlatformId;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  autoPilotEnabled: boolean; // 24/7 AI Auto-Pilot Mode
  aiExcluded?: boolean; // When true, AI never auto-replies or suggests replies for this contact/conversation
  isHandover: boolean; // Flagged for Human Handover
  handoverReason?: string;
  status: 'active' | 'resolved' | 'pending';
  messages: OmniMessage[];
}

export interface CannedResponse {
  id: string;
  title: string;
  shortcut: string;
  text: string;
  category: 'delivery' | 'pricing' | 'order' | 'support' | 'general';
}

export interface PlatformApiConfig {
  meta: {
    appId: string;
    appSecret: string;
    pageAccessToken: string;
    pageId: string;
    instagramAccountId: string;
    verifyToken: string;
    isConnected: boolean;
    lastPingStatus?: 'success' | 'failed' | 'pending';
    lastPingTime?: string;
  };
  telegram: {
    authMode?: 'qr' | 'bot';
    // QR Code / User Account authentication
    userSessionString?: string;
    userPhone?: string;
    userName?: string;
    userUsername?: string;
    userId?: string;
    isUserConnected?: boolean;
    // Bot API authentication
    botToken: string;
    botUsername?: string;
    botName?: string;
    channelUsernameOrId: string;
    adminChatId: string;
    targetChannels?: Array<{ id: string; name: string; type: 'channel' | 'group' | 'supergroup' | 'chat'; verified?: boolean; memberCount?: number }>;
    isConnected: boolean;
    lastPingStatus?: 'success' | 'failed' | 'pending';
    lastPingTime?: string;
  };
  tiktok: {
    clientKey: string;
    clientSecret: string;
    creatorAccountId: string;
    accessToken: string;
    isConnected: boolean;
    lastPingStatus?: 'success' | 'failed' | 'pending';
    lastPingTime?: string;
  };
  youtube: {
    apiKey: string;
    clientId: string;
    clientSecret: string;
    channelId: string;
    channelTitle?: string;
    channelHandle?: string;
    subscriberCount?: string | number;
    accessToken: string;
    refreshToken?: string;
    isConnected: boolean;
    lastPingStatus?: 'success' | 'failed' | 'pending';
    lastPingTime?: string;
  };
  whatsapp: {
    mode: 'builtin' | 'external';
    gatewayUrl: string;
    apiKey: string;
    channelId: string;
    baileysSessionId: string;
    connectedPhone?: string;
    isConnected: boolean;
    lastPingStatus?: 'success' | 'failed' | 'pending';
    lastPingTime?: string;
  };
  webhooks: {
    metaWebhookUrl: string;
    telegramWebhookUrl: string;
    tiktokWebhookUrl: string;
    whatsappWebhookUrl: string;
  };
}
