import React, { useState, useEffect, useRef } from 'react';
import SocialMediaTopNav from './SocialMediaTopNav';
import {
  MessageSquare,
  Bot,
  Send,
  Sparkles,
  Zap,
  Phone,
  User,
  Clock,
  CheckCheck,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Smile,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Layers,
  ChevronRight,
  MoreVertical,
  RotateCw,
  RefreshCw,
  Facebook,
  Instagram,
  Music2,
  Youtube,
  Radio,
  ShoppingBag,
  ExternalLink,
  Flame,
  ArrowRight,
  Video,
  ThumbsUp,
  MessageCircle,
  Sliders,
  Check,
  Heart,
  Loader2,
  Pencil,
  Trash2,
  Reply,
  X,
  Key,
  Lock,
  ShieldCheck,
  UserX,
  Pin,
  PinOff,
  Megaphone,
  Globe,
  Tag
} from 'lucide-react';
import { OmniConversation, OmniMessage, CannedResponse, SocialPlatformId, SOCIAL_PLATFORMS, CommentAutomationRule, PlatformApiConfig } from '../../types/social';
import {
  fetchOmniConversations,
  saveOmniConversation,
  subscribeToOmniConversations,
  fetchCannedResponses,
  saveCannedResponse,
  fetchCommentRules,
  saveCommentRule,
  subscribeToCommentRules,
  fetchPlatformApiConfig,
  savePlatformApiConfig
} from '../../services/socialDb';

export default function OmnichannelInboxPage() {
  const [conversations, setConversations] = useState<OmniConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('conv_fb_1');
  const selectedConvIdRef = useRef(selectedConvId);
  useEffect(() => {
    selectedConvIdRef.current = selectedConvId;
  }, [selectedConvId]);

  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [showCannedModal, setShowCannedModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Message Input State
  const [inputText, setInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // YouTube Comments & Live Stream Hub State (100% Real Live Data)
  const [showYtHubModal, setShowYtHubModal] = useState(false);
  const [ytActiveSubTab, setYtActiveSubTab] = useState<'comments' | 'live_chat' | 'auto_rules' | 'cta_pin'>('comments');
  const [ytComments, setYtComments] = useState<any[]>([]);

  // YouTube Channel Videos & CTA / Pin Comments State
  const [channelVideos, setChannelVideos] = useState<any[]>([]);
  const [loadingChannelVideos, setLoadingChannelVideos] = useState(false);
  const [showCtaCreatorModal, setShowCtaCreatorModal] = useState(false);
  const [selectedCtaVideoId, setSelectedCtaVideoId] = useState('');
  const [selectedCtaVideoTitle, setSelectedCtaVideoTitle] = useState('');
  const [customCtaVideoInput, setCustomCtaVideoInput] = useState('');
  const [ctaCommentText, setCtaCommentText] = useState('');
  const [ctaPinToTop, setCtaPinToTop] = useState(true);
  const [ctaGoalType, setCtaGoalType] = useState<'contact' | 'discount' | 'live' | 'website' | 'support' | 'custom'>('contact');
  const [ctaWebsiteUrl, setCtaWebsiteUrl] = useState('https://chartlogic.app');
  const [ctaPhone, setCtaPhone] = useState('+8801700-000000');
  const [ctaDiscountCode, setCtaDiscountCode] = useState('SPECIAL10');
  const [ctaCustomPrompt, setCtaCustomPrompt] = useState('');
  const [isGeneratingCtaAi, setIsGeneratingCtaAi] = useState(false);
  const [isSubmittingCta, setIsSubmittingCta] = useState(false);
  const [pinnedCommentsMap, setPinnedCommentsMap] = useState<Record<string, string>>({});
  const [pinningCommentId, setPinningCommentId] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>(() => {
    try {
      const s = localStorage.getItem('yt_liked_comments');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  const [commentLikeCounts, setCommentLikeCounts] = useState<Record<string, number>>(() => {
    try {
      const s = localStorage.getItem('yt_comment_like_counts');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  const [likedReplies, setLikedReplies] = useState<Record<string, boolean>>(() => {
    try {
      const s = localStorage.getItem('yt_liked_replies');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  const [replyLikeCounts, setReplyLikeCounts] = useState<Record<string, number>>(() => {
    try {
      const s = localStorage.getItem('yt_reply_like_counts');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyText, setEditingReplyText] = useState<string>('');
  const [editingCommentParentId, setEditingCommentParentId] = useState<string | null>(null);
  const [replyingToInfo, setReplyingToInfo] = useState<Record<string, { authorName: string; replyId?: string } | null>>({});
  const [myCustomReplyIds, setMyCustomReplyIds] = useState<Record<string, boolean>>(() => {
    try {
      const s = localStorage.getItem('yt_my_custom_reply_ids');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  const [isAiGeneratingReply, setIsAiGeneratingReply] = useState<Record<string, boolean>>({});
  const [ytLiveMessages, setYtLiveMessages] = useState<any[]>([]);
  const [ytLiveStatus, setYtLiveStatus] = useState<{ isStreamActive: boolean; liveTitle?: string; viewerCount?: string; liveVideoId?: string; liveChatId?: string }>({ isStreamActive: false });
  const [ytReplyDrafts, setYtReplyDrafts] = useState<Record<string, string>>({});
  const [ytLiveInput, setYtLiveInput] = useState('');
  const [loadingYt, setLoadingYt] = useState(false);
  const [ytRules, setYtRules] = useState<CommentAutomationRule[]>([]);
  
  // Real-Time Live Chat & Completed Live Stream State
  const [ytCommentFilter, setYtCommentFilter] = useState<'all' | 'live' | 'videos'>('all');
  const [liveViewMode, setLiveViewMode] = useState<'active_live' | 'past_livestreams'>('active_live');
  const [pastLiveStreams, setPastLiveStreams] = useState<any[]>([]);
  const [selectedPastStream, setSelectedPastStream] = useState<any | null>(null);
  const [loadingPastStreams, setLoadingPastStreams] = useState(false);
  const [liveAutoRefresh, setLiveAutoRefresh] = useState(true);
  const [liveRefreshInterval, setLiveRefreshInterval] = useState(3); // in seconds
  const [lastLiveSyncTime, setLastLiveSyncTime] = useState<Date>(new Date());
  const liveChatBottomRef = useRef<HTMLDivElement>(null);

  const [ytConfig, setYtConfig] = useState<{
    channelTitle?: string;
    channelHandle?: string;
    channelId?: string;
    apiKey?: string;
    accessToken?: string;
    subscriberCount?: string;
    isConnected?: boolean;
  }>({
    channelTitle: 'ChartLogic',
    channelHandle: '@chartlogic.trading',
    channelId: 'UC0LkvmsIkjj66DBYmI6o5gw',
    isConnected: true,
    subscriberCount: '5'
  });

  // YouTube OAuth Quick Connect Modal State
  const [showYtOAuthModal, setShowYtOAuthModal] = useState(false);
  const [oauthTokenInput, setOauthTokenInput] = useState('');
  const [testingOAuthToken, setTestingOAuthToken] = useState(false);
  const [oauthVerificationResult, setOauthVerificationResult] = useState<{ success: boolean; message: string; channelTitle?: string } | null>(null);

  // Followed Authors / Users Local State
  const [followedAuthors, setFollowedAuthors] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('yt_followed_authors');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleToggleFollow = (authorName: string, authorChannelUrl?: string) => {
    const isFollowed = !!followedAuthors[authorName];
    const updated = { ...followedAuthors, [authorName]: !isFollowed };
    setFollowedAuthors(updated);
    try {
      localStorage.setItem('yt_followed_authors', JSON.stringify(updated));
    } catch {}
    setStatusMessage({
      type: 'success',
      text: !isFollowed ? `✨ আপনি ${authorName}-কে ফলো করছেন!` : `${authorName}-কে আনফলো করা হয়েছে।`
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // New Simulated Incoming Message Modal
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simCustomerName, setSimCustomerName] = useState('Anika Rahman');
  const [simPlatform, setSimPlatform] = useState<SocialPlatformId>('instagram');
  const [simText, setSimText] = useState('ভাইয়া ঢাকা সিটির ভিতরে ডেলিভারি চার্জ কত এবং ক্যাশ অন ডেলিভারি দেওয়া যাবে?');

  // Real-Time Channels Live Connection Status & Sync State
  const [channelStatus, setChannelStatus] = useState<any>({
    whatsapp: { isConnected: false, title: 'WhatsApp' },
    telegram: { isConnected: false, title: 'Telegram' },
    facebook: { isConnected: false, title: 'Facebook' },
    instagram: { isConnected: false, title: 'Instagram' },
    tiktok: { isConnected: false, title: 'TikTok' },
    youtube: { isConnected: false, title: 'YouTube' }
  });
  const [isSyncingChannels, setIsSyncingChannels] = useState(false);

  const syncLiveConversationsAndChannels = async (isManual = false) => {
    if (isManual) setIsSyncingChannels(true);
    try {
      // 1. Fetch live connection statuses
      const statusRes = await fetch('/api/omni/channel-status');
      const statusData = await statusRes.json();
      if (statusData.success && statusData.channels) {
        setChannelStatus((prev: any) => {
          if (JSON.stringify(prev) !== JSON.stringify(statusData.channels)) {
            return statusData.channels;
          }
          return prev;
        });
      }

      // 2. Fetch live server conversations (including incoming WhatsApp/Telegram)
      const convsRes = await fetch('/api/omni/conversations');
      const convsData = await convsRes.json();
      if (convsData.success && Array.isArray(convsData.conversations)) {
        setConversations(prev => {
          const serverMap = new Map<string, any>(convsData.conversations.map((c: any) => [c.id, c]));
          let hasDiff = prev.length !== convsData.conversations.length;
          
          if (!hasDiff) {
            for (const p of prev) {
              const serverConv = serverMap.get(p.id);
              if (!serverConv || serverConv.messages?.length !== p.messages?.length || serverConv.lastMessageTime !== p.lastMessageTime || serverConv.unreadCount !== p.unreadCount) {
                hasDiff = true;
                break;
              }
            }
          }

          if (!hasDiff) return prev; // Retain exact reference to prevent full page/component re-render

          const merged = [...convsData.conversations];
          for (const localConv of prev) {
            if (!serverMap.has(localConv.id)) {
              merged.push(localConv);
            }
          }
          return merged;
        });
      }
    } catch (err) {
      console.warn('Sync live channels error:', err);
    } finally {
      if (isManual) setIsSyncingChannels(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    syncLiveConversationsAndChannels(false);

    // 1. Instant Real-Time SSE Live Push Stream (No page reload, instant message arrival)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/omni/stream');
      
      eventSource.onmessage = (event) => {
        try {
          if (!event.data) return;
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'new_message' && payload.data) {
            const { conversationId, message, conversation } = payload.data;
            if (!message || !conversationId) return;

            setConversations(prev => {
              const existingIdx = prev.findIndex(c => c.id === conversationId);
              if (existingIdx >= 0) {
                const existingConv = prev[existingIdx];
                // Check if message already recorded to prevent duplicate
                const msgExists = existingConv.messages.some((m: any) => m.id === message.id);
                if (msgExists) return prev;

                const isSelected = selectedConvIdRef.current === conversationId;
                const updatedConv: OmniConversation = {
                  ...existingConv,
                  lastMessage: message.text,
                  lastMessageTime: message.timestamp,
                  unreadCount: (isSelected || message.sender === 'agent') 
                    ? 0 
                    : (existingConv.unreadCount || 0) + 1,
                  messages: [...existingConv.messages, message]
                };

                const next = [...prev];
                next.splice(existingIdx, 1);
                next.unshift(updatedConv);
                return next;
              } else if (conversation) {
                return [conversation, ...prev];
              }
              return prev;
            });
          }
        } catch (e) {}
      };
    } catch (sseErr) {
      console.warn('SSE stream notice:', sseErr);
    }

    // 2. Background fallback poller (every 15 seconds silent sync)
    const livePoll = setInterval(() => syncLiveConversationsAndChannels(false), 15000);

    const unsub = subscribeToOmniConversations((data) => {
      setConversations(prev => {
        const dataMap = new Map(data.map((c: any) => [c.id, c]));
        let hasDiff = prev.length !== data.length;
        if (!hasDiff) {
          for (const p of prev) {
            const d = dataMap.get(p.id);
            if (!d || d.messages?.length !== p.messages?.length || d.lastMessageTime !== p.lastMessageTime) {
              hasDiff = true;
              break;
            }
          }
        }
        if (!hasDiff) return prev;

        const merged = [...data];
        for (const p of prev) {
          if (!dataMap.has(p.id) && p.id.startsWith('whatsapp_')) {
            merged.unshift(p);
          }
        }
        return merged;
      });
      setLoading(false);
      if (data.length > 0 && !selectedConvId) {
        setSelectedConvId(data[0].id);
      }
    });

    const unsubRules = subscribeToCommentRules((rulesData) => {
      // Filter rules for YouTube
      const ytFiltered = rulesData.filter(r => r.platforms.includes('youtube') || r.platforms.length === 0);
      setYtRules(ytFiltered.length > 0 ? ytFiltered : rulesData);
    });

    fetchCannedResponses().then(data => setCannedResponses(data));
    loadYtConfigAndSync();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(livePoll);
      unsub();
      unsubRules();
    };
  }, []);

  const loadYtConfigAndSync = async () => {
    try {
      const cfg = await fetchPlatformApiConfig();
      if (cfg?.youtube) {
        setYtConfig({
          channelTitle: cfg.youtube.channelTitle || 'ChartLogic',
          channelHandle: cfg.youtube.channelHandle || '@chartlogic.trading',
          channelId: cfg.youtube.channelId || 'UC0LkvmsIkjj66DBYmI6o5gw',
          apiKey: cfg.youtube.apiKey,
          accessToken: cfg.youtube.accessToken,
          subscriberCount: cfg.youtube.subscriberCount ? String(cfg.youtube.subscriberCount) : '5',
          isConnected: cfg.youtube.isConnected
        });
        if (cfg.youtube.accessToken) {
          setOauthTokenInput(cfg.youtube.accessToken);
        }
      }
      fetchYtComments(cfg?.youtube);
      fetchYtLiveChat(cfg?.youtube);
      fetchPastLiveStreams(cfg?.youtube);
      fetchChannelVideos(cfg?.youtube);
      fetchPinnedComments();
    } catch (e) {
      fetchYtComments();
      fetchYtLiveChat();
      fetchPastLiveStreams();
      fetchChannelVideos();
      fetchPinnedComments();
    }
  };

  // Real-time live chat background auto-polling
  useEffect(() => {
    if (!liveAutoRefresh || ytActiveSubTab !== 'live_chat' || liveViewMode !== 'active_live') return;

    const intervalMs = Math.max(2, liveRefreshInterval || 3) * 1000;
    const timer = setInterval(() => {
      fetchYtLiveChat();
      setLastLiveSyncTime(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [liveAutoRefresh, ytActiveSubTab, liveViewMode, liveRefreshInterval, ytConfig]);

  // Auto-scroll to bottom on incoming live chat message
  useEffect(() => {
    if (ytActiveSubTab === 'live_chat' && liveViewMode === 'active_live') {
      liveChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [ytLiveMessages.length, ytActiveSubTab, liveViewMode]);

  const handleVerifyAndSaveOAuthToken = async (tokenToSave?: string) => {
    const token = (tokenToSave || oauthTokenInput).trim();
    if (!token) {
      alert('অনুগ্রহ করে একটি বৈধ Google OAuth Access Token প্রদান করুন।');
      return;
    }
    setTestingOAuthToken(true);
    setOauthVerificationResult(null);
    try {
      const res = await fetch('/api/youtube/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token })
      });
      const data = await res.json();
      if (data.success) {
        setOauthVerificationResult({
          success: true,
          message: data.message || 'টোকেন সফলভাবে যাচাই ও সক্রিয় হয়েছে!',
          channelTitle: data.channelTitle
        });

        // Update persistent database configuration
        const currentCfg = await fetchPlatformApiConfig();
        const updatedYtCfg = {
          ...currentCfg,
          youtube: {
            ...currentCfg.youtube,
            accessToken: token,
            channelTitle: data.channelTitle || currentCfg.youtube?.channelTitle || ytConfig.channelTitle,
            channelId: data.channelId || currentCfg.youtube?.channelId || ytConfig.channelId,
            subscriberCount: data.subscriberCount || currentCfg.youtube?.subscriberCount || ytConfig.subscriberCount,
            isConnected: true
          }
        };
        await savePlatformApiConfig(updatedYtCfg);

        // Update local ytConfig state
        setYtConfig(prev => ({
          ...prev,
          accessToken: token,
          channelTitle: data.channelTitle || prev.channelTitle,
          channelId: data.channelId || prev.channelId,
          subscriberCount: data.subscriberCount || prev.subscriberCount,
          isConnected: true
        }));

        setStatusMessage({
          type: 'success',
          text: `🎉 YouTube OAuth সক্রিয় হয়েছে! (${data.channelTitle}) - এখন আপনার প্রতিটি রিপ্লাই ও লাইক সরাসরি YouTube-এ পোস্ট হবে।`
        });
        setTimeout(() => {
          setShowYtOAuthModal(false);
          setStatusMessage(null);
        }, 2000);
      } else {
        setOauthVerificationResult({
          success: false,
          message: data.error || 'টোকেন ভেরিফিকেশন ব্যর্থ হয়েছে। অনুগ্রহ করে সঠিক টোকেন প্রদান করুন।'
        });
      }
    } catch (e: any) {
      setOauthVerificationResult({
        success: false,
        message: 'সার্ভার ভেরিফিকেশনে ত্রুটি: ' + (e?.message || 'অজানা ত্রুটি')
      });
    } finally {
      setTestingOAuthToken(false);
    }
  };

  const fetchYtComments = async (overrideYtConfig?: any) => {
    setLoadingYt(true);
    try {
      const activeCfg = overrideYtConfig || ytConfig;
      const res = await fetch('/api/youtube/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: activeCfg?.apiKey,
          channelId: activeCfg?.channelId
        })
      });
      const data = await res.json();
      if (data.comments && Array.isArray(data.comments)) {
        // Merge with local user-created replies so they never disappear across refreshes
        let savedLocalReplies: Record<string, any[]> = {};
        try {
          const s = localStorage.getItem('yt_local_user_replies');
          if (s) savedLocalReplies = JSON.parse(s);
        } catch {}

        const merged = data.comments.map((c: any) => {
          const localReps = savedLocalReplies[c.id] || [];
          if (localReps.length === 0) return c;
          const existingIds = new Set((c.replies || []).map((r: any) => r.id));
          const newUniqueLocalReps = localReps.filter((lr: any) => !existingIds.has(lr.id));
          return {
            ...c,
            totalReplyCount: (c.totalReplyCount || 0) + newUniqueLocalReps.length,
            replies: [...(c.replies || []), ...newUniqueLocalReps]
          };
        });
        setYtComments(merged);
      } else {
        setYtComments([]);
      }
    } catch (e) {
      console.warn('Error fetching yt comments:', e);
      setYtComments([]);
    } finally {
      setLoadingYt(false);
    }
  };

  const fetchYtLiveChat = async (overrideYtConfig?: any) => {
    try {
      const activeCfg = overrideYtConfig || ytConfig;
      const queryParams = new URLSearchParams();
      if (activeCfg?.apiKey) queryParams.set('apiKey', activeCfg.apiKey);
      if (activeCfg?.channelId) queryParams.set('channelId', activeCfg.channelId);

      const res = await fetch(`/api/youtube/live-chat/messages?${queryParams.toString()}`);
      const data = await res.json();
      if (data.liveMessages) {
        setYtLiveMessages(data.liveMessages);
      } else {
        setYtLiveMessages([]);
      }
      setYtLiveStatus({
        isStreamActive: !!data.isStreamActive,
        liveTitle: data.liveTitle,
        viewerCount: data.viewerCount,
        liveVideoId: data.liveVideoId,
        liveChatId: data.liveChatId
      });
      if (data.pollingIntervalMillis) {
        const optimalSeconds = Math.max(2, Math.round(data.pollingIntervalMillis / 1000));
        setLiveRefreshInterval(optimalSeconds);
      }
      setLastLiveSyncTime(new Date());
    } catch (e) {
      console.warn('Error fetching live chat:', e);
      setYtLiveMessages([]);
      setYtLiveStatus({ isStreamActive: false });
    }
  };

  const fetchPastLiveStreams = async (overrideYtConfig?: any) => {
    setLoadingPastStreams(true);
    try {
      const activeCfg = overrideYtConfig || ytConfig;
      const queryParams = new URLSearchParams();
      if (activeCfg?.apiKey) queryParams.set('apiKey', activeCfg.apiKey);
      if (activeCfg?.channelId) queryParams.set('channelId', activeCfg.channelId);

      const res = await fetch(`/api/youtube/past-livestreams?${queryParams.toString()}`);
      const data = await res.json();
      if (data.pastStreams && Array.isArray(data.pastStreams)) {
        setPastLiveStreams(data.pastStreams);
      } else {
        setPastLiveStreams([]);
      }
    } catch (e) {
      console.warn('Error fetching past livestreams:', e);
      setPastLiveStreams([]);
    } finally {
      setLoadingPastStreams(false);
    }
  };

  const fetchChannelVideos = async (overrideYtConfig?: any) => {
    setLoadingChannelVideos(true);
    try {
      const activeCfg = overrideYtConfig || ytConfig;
      const queryParams = new URLSearchParams();
      if (activeCfg?.apiKey) queryParams.set('apiKey', activeCfg.apiKey);
      if (activeCfg?.channelId) queryParams.set('channelId', activeCfg.channelId);

      const res = await fetch(`/api/youtube/channel-videos?${queryParams.toString()}`);
      const data = await res.json();
      if (data.videos && Array.isArray(data.videos)) {
        setChannelVideos(data.videos);
        if (!selectedCtaVideoId && data.videos.length > 0) {
          setSelectedCtaVideoId(data.videos[0].id);
          setSelectedCtaVideoTitle(data.videos[0].title);
        }
      } else {
        setChannelVideos([]);
      }
    } catch (e) {
      console.warn('Error fetching channel videos:', e);
      setChannelVideos([]);
    } finally {
      setLoadingChannelVideos(false);
    }
  };

  const fetchPinnedComments = async () => {
    try {
      const res = await fetch('/api/youtube/pinned-comments');
      const data = await res.json();
      if (data.pinnedComments) {
        setPinnedCommentsMap(data.pinnedComments);
      }
    } catch (e) {
      console.warn('Error fetching pinned comments map:', e);
    }
  };

  const handleTogglePinComment = async (videoId: string, commentId: string, currentlyPinned: boolean) => {
    setPinningCommentId(commentId);
    const newPinnedState = !currentlyPinned;

    // Optimistically update comments in list
    setYtComments(prev => {
      const updated = prev.map(c => {
        if (c.videoId === videoId) {
          if (c.id === commentId) {
            return { ...c, isPinned: newPinnedState };
          }
          if (newPinnedState && c.id !== commentId) {
            return { ...c, isPinned: false };
          }
        }
        return c;
      });
      return updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
    });

    setPinnedCommentsMap(prev => {
      const updated = { ...prev };
      if (newPinnedState) {
        updated[videoId] = commentId;
      } else {
        delete updated[videoId];
      }
      return updated;
    });

    try {
      const res = await fetch('/api/youtube/pin-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId,
          commentId,
          isPinned: newPinnedState
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: newPinnedState ? '📌 কমেন্টটি সফলভাবে ভিডিওর শীর্ষে পিন (Pinned to Top) করা হয়েছে!' : 'কমেন্টটি আন-পিন (Unpinned) করা হয়েছে।'
        });
      }
    } catch (e) {
      console.warn('Error toggling pin:', e);
    } finally {
      setPinningCommentId(null);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const handlePostCtaComment = async () => {
    const finalVideoId = customCtaVideoInput.trim() || selectedCtaVideoId;
    const text = ctaCommentText.trim();
    if (!finalVideoId) {
      setStatusMessage({ type: 'error', text: 'অনুগ্রহ করে একটি ভিডিও নির্বাচন করুন বা ভিডিওর ID দিন' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    if (!text) {
      setStatusMessage({ type: 'error', text: 'কমেন্টের বক্তব্য লিখুন' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setIsSubmittingCta(true);
    try {
      const res = await fetch('/api/youtube/post-cta-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: finalVideoId,
          commentText: text,
          pinComment: ctaPinToTop,
          accessToken: ytConfig?.accessToken,
          apiKey: ytConfig?.apiKey
        })
      });
      const data = await res.json();
      if (data.success && data.comment) {
        const createdComment = {
          ...data.comment,
          videoTitle: selectedCtaVideoTitle || data.comment.videoTitle || 'YouTube Video'
        };

        setYtComments(prev => {
          const list = [createdComment, ...prev.filter(c => c.id !== createdComment.id)];
          if (ctaPinToTop) {
            return list.map(c => {
              if (c.videoId === finalVideoId && c.id !== createdComment.id) {
                return { ...c, isPinned: false };
              }
              return c;
            }).sort((a, b) => {
              if (a.isPinned && !b.isPinned) return -1;
              if (!a.isPinned && b.isPinned) return 1;
              return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
            });
          }
          return list;
        });

        if (ctaPinToTop) {
          setPinnedCommentsMap(prev => ({ ...prev, [finalVideoId]: createdComment.id }));
        }

        setStatusMessage({
          type: 'success',
          text: data.message || '✅ কল টু অ্যাকশন (CTA) কমেন্ট সফলভাবে পোস্ট ও পিন করা হয়েছে!'
        });
        setCtaCommentText('');
        setShowCtaCreatorModal(false);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'কমেন্ট পোস্ট করতে সমস্যা হয়েছে' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'সার্ভার ত্রুটি: ' + e?.message });
    } finally {
      setIsSubmittingCta(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleGenerateAiCta = async () => {
    setIsGeneratingCtaAi(true);
    try {
      const res = await fetch('/api/ai/generate-youtube-cta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoTitle: selectedCtaVideoTitle || 'YouTube Channel Video',
          ctaType: ctaGoalType,
          websiteUrl: ctaWebsiteUrl,
          phone: ctaPhone,
          discountCode: ctaDiscountCode,
          customPrompt: ctaCustomPrompt
        })
      });
      const data = await res.json();
      if (data.success && data.ctaText) {
        setCtaCommentText(data.ctaText);
        setStatusMessage({ type: 'success', text: '✨ Gemini AI আকর্ষণীয় CTA কমেন্ট তৈরি করেছে!' });
      }
    } catch (e) {
      console.warn('AI CTA error:', e);
    } finally {
      setIsGeneratingCtaAi(false);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleSelectCtaTemplate = (type: 'contact' | 'discount' | 'live' | 'website' | 'support') => {
    setCtaGoalType(type);
    if (type === 'contact') {
      setCtaCommentText(`📌 যেকোনো প্রশ্ন, অর্ডার বা বিস্তারিত জানতে আমাদের সরাসরি কল করুন বা WhatsApp-এ মেসেজ দিন 👇\n\n📞 হটলাইন: ${ctaPhone || '01700-000000'}\n🌐 ওয়েবসাইট: ${ctaWebsiteUrl || 'https://chartlogic.app'}\n✨ নতুন ভিডিও ও আপডেট পেতে চ্যানেলটি সাবস্ক্রাইব করে রাখুন!`);
    } else if (type === 'discount') {
      setCtaCommentText(`🔥 বিশেষ অফার! এই ভিডিওর দর্শকদের জন্য স্পেশাল প্রোমোকোড: "${ctaDiscountCode || 'SPECIAL10'}" (১০% পর্যন্ত অতিরিক্ত ছাড়!)\n\n🛒 অর্ডার করতে এখনই ভিজিট করুন: ${ctaWebsiteUrl || 'https://chartlogic.app'}\n📦 সারা বাংলাদেশে ক্যাশ অন হোম ডেলিভারি সুবিধা!`);
    } else if (type === 'live') {
      setCtaCommentText(`🔴 আমাদের লাইভ স্ট্রিমে যুক্ত হওয়ার জন্য সবাইকে অসংখ্য ধন্যবাদ! আজকের লাইভ সেশন বা প্রোডাক্ট সম্পর্কিত যেকোনো প্রশ্ন নিচে কমেন্টে জানান 👇\n\n💬 আমরা প্রতিটি কমেন্টের সরাসরি উত্তর দিচ্ছি!`);
    } else if (type === 'website') {
      setCtaCommentText(`🌐 বিস্তারিত জানতে ও আমাদের সকল সার্ভিস/প্রোডাক্ট দেখতে অফিশিয়াল ওয়েবসাইটে ভিজিট করুন 👇\n\n👉 ওয়েবসাইট লিংক: ${ctaWebsiteUrl || 'https://chartlogic.app'}\n🎁 রেজিস্ট্রেশন করলেই পাচ্ছেন আকর্ষণীয় ওয়েলকাম গিফট!`);
    } else if (type === 'support') {
      setCtaCommentText(`🤝 কোনো সমস্যা বা কারিগরি সহায়তার প্রয়োজন হলে আমাদের সাপোর্ট টিম ২৪/৭ প্রস্তুত রয়েছে:\n\n📩 ইনবক্স করুন অথবা কল করুন: ${ctaPhone || '01700-000000'}\n❤️ আপনার মতামত ও পরামর্শ কমেন্টে লিখে জানান!`);
    }
  };

  const handleSendLiveChatMsg = async () => {
    const msg = ytLiveInput.trim();
    if (!msg) return;

    const newLocalMsg = {
      id: 'live_' + Date.now(),
      authorName: ytConfig.channelTitle || 'ChartLogic (Host)',
      authorAvatar: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=60',
      message: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isChatOwner: true,
      isChatModerator: true,
      isPinned: false
    };

    setYtLiveMessages(prev => [...prev, newLocalMsg]);
    setYtLiveInput('');
    setStatusMessage({ type: 'success', text: '✅ লাইভ মেসেজ সফলভাবে পাঠানো হয়েছে!' });
    setTimeout(() => setStatusMessage(null), 3000);

    try {
      await fetch('/api/youtube/live-chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          liveChatId: ytLiveStatus.liveChatId,
          message: msg,
          accessToken: ytConfig?.accessToken,
          apiKey: ytConfig?.apiKey
        })
      });
    } catch (e) {
      console.warn('Send live chat error:', e);
    }
  };

  const handleMentionLiveViewer = (viewerName: string) => {
    const cleanName = (viewerName || '').replace(/^@/, '').trim();
    setYtLiveInput(prev => `@${cleanName} ${prev.replace(new RegExp(`^@${cleanName}\\s*`), '')}`);
  };

  const handleManualRefreshYt = async () => {
    setLoadingYt(true);
    await loadYtConfigAndSync();
    setStatusMessage({ type: 'success', text: '✅ YouTube রিয়েল ডেটা সিঙ্ক সম্পন্ন হয়েছে!' });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleToggleYtRule = async (rule: CommentAutomationRule) => {
    const updatedRule = { ...rule, isActive: !rule.isActive };
    await saveCommentRule(updatedRule);
    setYtRules(prev => prev.map(r => r.id === rule.id ? updatedRule : r));
    setStatusMessage({
      type: 'success',
      text: updatedRule.isActive ? '✅ রুলটি সক্রিয় করা হয়েছে!' : '⏸️ রুলটি সাময়িকভাবে বন্ধ করা হয়েছে।'
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSendYtReply = async (commentId: string) => {
    const text = (ytReplyDrafts[commentId] || '').trim();
    if (!text) return;

    const newRepId = 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newReplyObj = {
      id: newRepId,
      parentId: commentId,
      authorDisplayName: ytConfig.channelTitle || 'ChartLogic (You)',
      authorProfileImageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100&auto=format&fit=crop&q=60',
      textDisplay: text,
      textOriginal: text,
      publishedAt: new Date().toISOString(),
      isOwner: true,
      likeCount: 0
    };

    // 1. Immediately update UI state
    setMyCustomReplyIds(prev => {
      const updated = { ...prev, [newRepId]: true };
      try { localStorage.setItem('yt_my_custom_reply_ids', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setYtComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          totalReplyCount: (c.totalReplyCount || 0) + 1,
          replies: [...(c.replies || []), newReplyObj]
        };
      }
      return c;
    }));

    // 2. Persist locally in localStorage
    try {
      const saved = localStorage.getItem('yt_local_user_replies');
      const parsed = saved ? JSON.parse(saved) : {};
      parsed[commentId] = [...(parsed[commentId] || []), newReplyObj];
      localStorage.setItem('yt_local_user_replies', JSON.stringify(parsed));
    } catch {}

    setYtReplyDrafts(prev => ({ ...prev, [commentId]: '' }));
    setReplyingToInfo(prev => ({ ...prev, [commentId]: null }));
    setStatusMessage({ type: 'success', text: '✅ কমেন্টের উত্তর সফলভাবে পাবলিশ হয়েছে!' });
    setTimeout(() => setStatusMessage(null), 3500);

    // 3. Dispatch to server to push to YouTube Data API
    try {
      const res = await fetch('/api/youtube/reply-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          parentId: commentId,
          replyText: text,
          apiKey: ytConfig?.apiKey,
          accessToken: ytConfig?.accessToken
        })
      });
      const data = await res.json();
      if (data.success && data.reply?.id && data.reply.id !== newRepId) {
        const realId = data.reply.id;
        setMyCustomReplyIds(prev => {
          const updated = { ...prev, [realId]: true };
          try { localStorage.setItem('yt_my_custom_reply_ids', JSON.stringify(updated)); } catch {}
          return updated;
        });
        setYtComments(prev => prev.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: (c.replies || []).map((r: any) => r.id === newRepId ? { ...r, id: realId } : r)
            };
          }
          return c;
        }));
      }
    } catch (e: any) {
      console.warn('Backend reply notice:', e);
    }
  };

  const handleToggleYtLike = async (commentId: string, initialLikeCount: number = 0) => {
    const isCurrentlyLiked = !!likedComments[commentId];
    const newLikedState = !isCurrentlyLiked;
    const currentCount = commentLikeCounts[commentId] !== undefined ? commentLikeCounts[commentId] : (initialLikeCount || 0);
    const newCount = newLikedState ? currentCount + 1 : Math.max(0, currentCount - 1);

    setLikedComments(prev => {
      const updated = { ...prev, [commentId]: newLikedState };
      try { localStorage.setItem('yt_liked_comments', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setCommentLikeCounts(prev => {
      const updated = { ...prev, [commentId]: newCount };
      try { localStorage.setItem('yt_comment_like_counts', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setStatusMessage({
      type: 'success',
      text: newLikedState ? '❤️ কমেন্টে লাইক প্রদান করা হয়েছে!' : 'কমেন্ট থেকে লাইক রিমুভ করা হয়েছে।'
    });
    setTimeout(() => setStatusMessage(null), 2500);

    try {
      await fetch('/api/youtube/like-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          rating: newLikedState ? 'like' : 'none',
          accessToken: ytConfig?.accessToken
        })
      });
    } catch (e) {
      console.warn('Like toggle error:', e);
    }
  };

  const handleToggleReplyLike = async (replyId: string, initialCount: number = 0) => {
    const isCurrentlyLiked = !!likedReplies[replyId];
    const newLiked = !isCurrentlyLiked;
    const currentCount = replyLikeCounts[replyId] !== undefined ? replyLikeCounts[replyId] : initialCount;
    const newCount = newLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    setLikedReplies(prev => {
      const updated = { ...prev, [replyId]: newLiked };
      try { localStorage.setItem('yt_liked_replies', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setReplyLikeCounts(prev => {
      const updated = { ...prev, [replyId]: newCount };
      try { localStorage.setItem('yt_reply_like_counts', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setStatusMessage({
      type: 'success',
      text: newLiked ? '❤️ রিপ্লাইয়ে লাইক প্রদান করা হয়েছে!' : 'রিপ্লাই থেকে লাইক রিমুভ করা হয়েছে।'
    });
    setTimeout(() => setStatusMessage(null), 2500);

    try {
      await fetch('/api/youtube/like-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: replyId,
          rating: newLiked ? 'like' : 'none',
          accessToken: ytConfig?.accessToken
        })
      });
    } catch (e) {
      console.warn('Reply like error:', e);
    }
  };

  const isMyReplyOrComment = (rep: any) => {
    if (!rep) return false;
    if (myCustomReplyIds[rep.id]) return true;
    if (rep.isOwner || rep.isChatOwner || rep.isMyComment) return true;
    const name = (rep.authorDisplayName || '').toLowerCase();
    if (name.includes('(you)') || name.includes('chartlogic') || name.includes('channel owner') || name.includes('host') || name.includes('moderator')) return true;
    if (ytConfig.channelTitle && name === ytConfig.channelTitle.toLowerCase().trim()) return true;
    return false;
  };

  const handleStartEditReply = (rep: any, parentCommentId?: string) => {
    setEditingReplyId(rep.id);
    setEditingReplyText(rep.textOriginal || rep.textDisplay || '');
    setEditingCommentParentId(parentCommentId || null);
  };

  const handleStartEditTopComment = (comment: any) => {
    setEditingReplyId(comment.id);
    setEditingReplyText(comment.textOriginal || comment.textDisplay || '');
    setEditingCommentParentId(comment.id);
  };

  const handleCancelEditReply = () => {
    setEditingReplyId(null);
    setEditingReplyText('');
    setEditingCommentParentId(null);
  };

  const handleSaveEditReply = async (commentId: string, replyId: string) => {
    if (!editingReplyText.trim()) return;
    const updatedText = editingReplyText.trim();

    // 1. Update State
    setYtComments(prev => prev.map(c => {
      if (c.id === commentId) {
        if (commentId === replyId) {
          // Editing top level comment
          return {
            ...c,
            textDisplay: updatedText,
            textOriginal: updatedText,
            isEdited: true
          };
        }
        // Editing sub-reply
        return {
          ...c,
          replies: (c.replies || []).map((r: any) => {
            if (r.id === replyId) {
              return {
                ...r,
                textDisplay: updatedText,
                textOriginal: updatedText,
                isEdited: true
              };
            }
            return r;
          })
        };
      }
      return c;
    }));

    // 2. Persist in localStorage
    try {
      const saved = localStorage.getItem('yt_local_user_replies');
      const parsed = saved ? JSON.parse(saved) : {};
      if (parsed[commentId]) {
        parsed[commentId] = parsed[commentId].map((r: any) => {
          if (r.id === replyId) {
            return { ...r, textDisplay: updatedText, textOriginal: updatedText, isEdited: true };
          }
          return r;
        });
        localStorage.setItem('yt_local_user_replies', JSON.stringify(parsed));
      }
    } catch {}

    setEditingReplyId(null);
    setEditingReplyText('');
    setEditingCommentParentId(null);

    setStatusMessage({ type: 'success', text: '✅ কমেন্ট সফলভাবে এডিট ও আপডেট করা হয়েছে!' });
    setTimeout(() => setStatusMessage(null), 3500);

    // 3. Send to API
    try {
      await fetch('/api/youtube/edit-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: replyId,
          updatedText,
          accessToken: ytConfig?.accessToken
        })
      });
    } catch (e) {
      console.warn('Edit comment notice:', e);
    }
  };

  const handleDeleteTopComment = async (commentId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে আপনার এই কমেন্টটি মুছে ফেলতে চান?')) return;

    setYtComments(prev => prev.filter(c => c.id !== commentId));
    setStatusMessage({ type: 'success', text: '🗑️ কমেন্ট সফলভাবে মুছে ফেলা হয়েছে!' });
    setTimeout(() => setStatusMessage(null), 3000);

    try {
      await fetch('/api/youtube/delete-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          accessToken: ytConfig?.accessToken
        })
      });
    } catch (e) {
      console.warn('Delete comment notice:', e);
    }
  };

  const handleDeleteReply = async (commentId: string, replyId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে আপনার এই উত্তরটি মুছে ফেলতে চান?')) return;

    setYtComments(prev => prev.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          totalReplyCount: Math.max(0, (c.totalReplyCount || 1) - 1),
          replies: (c.replies || []).filter((r: any) => r.id !== replyId)
        };
      }
      return c;
    }));

    try {
      const saved = localStorage.getItem('yt_local_user_replies');
      const parsed = saved ? JSON.parse(saved) : {};
      if (parsed[commentId]) {
        parsed[commentId] = parsed[commentId].filter((r: any) => r.id !== replyId);
        localStorage.setItem('yt_local_user_replies', JSON.stringify(parsed));
      }
    } catch {}

    setStatusMessage({ type: 'success', text: '🗑️ উত্তর সফলভাবে মুছে ফেলা হয়েছে!' });
    setTimeout(() => setStatusMessage(null), 3000);

    try {
      await fetch('/api/youtube/delete-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId: replyId,
          accessToken: ytConfig?.accessToken
        })
      });
    } catch (e) {
      console.warn('Delete reply notice:', e);
    }
  };

  const handleReplyToAuthor = (commentId: string, authorName: string, replyId?: string) => {
    const cleanAuthor = (authorName || '').replace(/^@/, '').trim();
    const mention = cleanAuthor ? `@${cleanAuthor} ` : '';
    
    setReplyingToInfo(prev => ({
      ...prev,
      [commentId]: { authorName: cleanAuthor, replyId }
    }));

    setYtReplyDrafts(prev => {
      const current = prev[commentId] || '';
      if (current.includes(mention)) return prev;
      return {
        ...prev,
        [commentId]: mention + current
      };
    });

    setTimeout(() => {
      const inputEl = document.getElementById(`yt-reply-input-${commentId}`) as HTMLInputElement | null;
      if (inputEl) {
        inputEl.focus();
        inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  const handleCancelReplyToAuthor = (commentId: string) => {
    setReplyingToInfo(prev => ({ ...prev, [commentId]: null }));
  };

  const handleInsertEmoji = (commentId: string, emoji: string) => {
    setYtReplyDrafts(prev => ({
      ...prev,
      [commentId]: (prev[commentId] || '') + emoji
    }));
  };

  const handleInsertEditEmoji = (emoji: string) => {
    setEditingReplyText(prev => prev + emoji);
  };

  const handleGenerateYtAiReply = async (commentId: string, commentText: string, authorName: string, videoTitle?: string, videoId?: string) => {
    try {
      setIsAiGeneratingReply(prev => ({ ...prev, [commentId]: true }));
      const res = await fetch('/api/ai/omnichannel-agent-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: commentText,
          customerName: authorName,
          platform: 'youtube',
          videoTitle: videoTitle || ytConfig.channelTitle || 'YouTube Video',
          videoId: videoId
        })
      });
      const data = await res.json();
      if (data.reply) {
        setYtReplyDrafts(prev => ({ ...prev, [commentId]: data.reply }));
      }
    } catch (e) {
      console.warn('AI reply generation failed:', e);
    } finally {
      setIsAiGeneratingReply(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Comprehensive helper to decode HTML entities, numeric character references, and emoji shortcodes
  const cleanCommentText = (text: string) => {
    if (!text) return '';
    let cleaned = text
      .replace(/<img[^>]*alt=["']([^"']+)["'][^>]*>/gi, '$1')
      .replace(/&#(\d+);/g, (_, dec) => {
        try {
          return String.fromCodePoint(parseInt(dec, 10));
        } catch {
          return '';
        }
      })
      .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => {
        try {
          return String.fromCodePoint(parseInt(hex, 16));
        } catch {
          return '';
        }
      });

    const entityMap: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&#x2F;': '/',
      '&nbsp;': ' ',
      '&hearts;': '❤️',
      '&heart;': '❤️',
      '&copy;': '©',
      '&trade;': '™'
    };

    for (const [ent, val] of Object.entries(entityMap)) {
      cleaned = cleaned.split(ent).join(val);
    }

    const shortcodes: Record<string, string> = {
      ':fire:': '🔥',
      ':heart:': '❤️',
      ':love:': '❤️',
      ':thumbsup:': '👍',
      ':like:': '👍',
      ':smile:': '😊',
      ':clap:': '👏',
      ':tada:': '🎉',
      ':100:': '💯',
      ':star:': '⭐',
      ':rocket:': '🚀',
      ':pray:': '🙏',
      ':check:': '✅'
    };

    for (const [sc, em] of Object.entries(shortcodes)) {
      cleaned = cleaned.split(sc).join(em);
    }

    return cleaned
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .trim();
  };

  const selectedConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  const prevMsgCountRef = useRef(0);
  useEffect(() => {
    const currentCount = selectedConv?.messages?.length || 0;
    if (currentCount !== prevMsgCountRef.current || isAiTyping) {
      prevMsgCountRef.current = currentCount;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedConv?.id, selectedConv?.messages?.length, isAiTyping]);

  // Extra Filter & New Chat Modal States
  const [onlyConnectedFilter, setOnlyConnectedFilter] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatPhone, setNewChatPhone] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [isStartingNewChat, setIsStartingNewChat] = useState(false);
  const [isSyncingGroups, setIsSyncingGroups] = useState(false);

  // Media Attachment State
  const [selectedAttachment, setSelectedAttachment] = useState<{
    dataUrl: string;
    name: string;
    type: 'image' | 'video' | 'document';
    size?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Omnichannel Auto-Reply, Exclusion Blacklist & Behavior Configuration
  interface ExcludedContact {
    id: string;
    identifier: string; // phone, username, or group id
    name: string;
    platform: SocialPlatformId | 'all';
    reason?: string;
    addedAt: string;
  }

  const [showAiConfigModal, setShowAiConfigModal] = useState(false);
  const [aiConfigTab, setAiConfigTab] = useState<'platforms' | 'exclusions' | 'model_rules'>('platforms');

  // Master switch for all AI auto-replies across all channels
  const [masterAiReplyEnabled, setMasterAiReplyEnabled] = useState<boolean>(() => {
    const val = localStorage.getItem('omni_master_ai_reply_enabled');
    return val !== null ? val === 'true' : true;
  });

  // Per-Platform AI Auto-Reply Enabled / Disabled Switches
  const [aiEnabledPlatforms, setAiEnabledPlatforms] = useState<Record<SocialPlatformId, boolean>>(() => {
    try {
      const saved = localStorage.getItem('omni_ai_enabled_platforms');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      whatsapp: true,
      telegram: true,
      facebook: true,
      instagram: true,
      tiktok: false,
      youtube: true
    };
  });

  // Blacklist of contacts/groups where AI is strictly prohibited from auto-replying
  const [excludedContacts, setExcludedContacts] = useState<ExcludedContact[]>(() => {
    try {
      const saved = localStorage.getItem('omni_ai_excluded_contacts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Manual exclusion inputs
  const [newExcludedInput, setNewExcludedInput] = useState('');
  const [newExcludedName, setNewExcludedName] = useState('');
  const [newExcludedPlatform, setNewExcludedPlatform] = useState<SocialPlatformId | 'all'>('all');
  const [newExcludedReason, setNewExcludedReason] = useState('');

  // Active AI Model selection (Gemini Flash, GPT-4o-mini, Claude, DeepSeek)
  const [activeAiBotModel, setActiveAiBotModel] = useState<string>(() => {
    return localStorage.getItem('omni_active_bot_model') || 'gemini:gemini-2.5-flash';
  });

  // AI Reply Execution Mode: Auto-Send directly to customer vs Draft & Human Review in composer
  const [aiReplyMode, setAiReplyMode] = useState<'auto_send' | 'draft_review'>(() => {
    return (localStorage.getItem('omni_ai_reply_mode') as any) || 'auto_send';
  });

  // API Key management directly in Omnichannel Settings
  const [openAiKeyInput, setOpenAiKeyInput] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('app_ai_config') || '{}');
      return cfg.openaiApiKey || '';
    } catch { return ''; }
  });
  const [geminiKeyInput, setGeminiKeyInput] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('app_ai_config') || '{}');
      return cfg.geminiApiKey || '';
    } catch { return ''; }
  });
  const [deepseekKeyInput, setDeepseekKeyInput] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('app_ai_config') || '{}');
      return cfg.deepseekApiKey || '';
    } catch { return ''; }
  });
  const [claudeKeyInput, setClaudeKeyInput] = useState(() => {
    try {
      const cfg = JSON.parse(localStorage.getItem('app_ai_config') || '{}');
      return cfg.claudeApiKey || '';
    } catch { return ''; }
  });
  const [keyTestStatus, setKeyTestStatus] = useState<string | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);

  // AI Persona / Tone
  const [aiTone, setAiTone] = useState<'friendly' | 'professional' | 'sales' | 'concise'>(() => {
    return (localStorage.getItem('omni_ai_tone') as any) || 'friendly';
  });

  const [customAiPrompt, setCustomAiPrompt] = useState(() => {
    return localStorage.getItem('omni_custom_ai_prompt') || 'কাস্টমারের প্রশ্নের স্পষ্ট এবং সংক্ষিপ্ত উত্তর দিন বাংলায়। কোনো জটিল সমস্যা বা অভিযোগ থাকলে সাহায্যকারী প্রতিনিধির সহায়তা নেওয়ার পরামর্শ দিন।';
  });
  const [customStoreContext, setCustomStoreContext] = useState(() => {
    return localStorage.getItem('omni_custom_store_context') || 'ঢাকা সিটির ভিতর ডেলিভারি চার্জ ৬০ টাকা (১-২ দিন), ঢাকার বাইরে ১২০ টাকা (২-৩ দিন)। ক্যাশ অন ডেলিভারি সুবিধা আছে।';
  });

  // Check if a conversation/contact is blacklisted / excluded from AI replies
  const isConvAiExcluded = (conv?: OmniConversation | null): boolean => {
    if (!conv) return false;
    if (conv.aiExcluded) return true;
    const phone = conv.customerPhone?.replace(/[^0-9]/g, '');
    const handle = conv.customerHandle?.toLowerCase().replace(/[@\s]/g, '');
    const name = conv.customerName?.toLowerCase();
    const id = conv.id;

    return excludedContacts.some(item => {
      if (item.platform !== 'all' && item.platform !== conv.platform) return false;
      const target = item.identifier.toLowerCase().replace(/[@\s]/g, '');
      const numTarget = item.identifier.replace(/[^0-9]/g, '');
      if (numTarget && phone && (phone.includes(numTarget) || numTarget.includes(phone))) return true;
      if (target && (handle?.includes(target) || id.includes(target) || (name && name.includes(target)))) return true;
      return false;
    });
  };

  // Toggle exclusion for currently opened chat
  const handleToggleExcludeCurrentConv = async () => {
    if (!selectedConv) return;
    const currentlyExcluded = isConvAiExcluded(selectedConv);
    const nextState = !currentlyExcluded;

    const updatedConv: OmniConversation = {
      ...selectedConv,
      aiExcluded: nextState
    };
    await saveOmniConversation(updatedConv);
    setConversations(prev => prev.map(c => c.id === selectedConv.id ? updatedConv : c));

    setExcludedContacts(prev => {
      let updated: ExcludedContact[];
      if (nextState) {
        const ident = selectedConv.customerPhone || selectedConv.customerHandle || selectedConv.id;
        const exists = prev.some(item => item.identifier === ident && (item.platform === selectedConv.platform || item.platform === 'all'));
        if (exists) {
          updated = prev;
        } else {
          updated = [
            ...prev,
            {
              id: 'ex_' + Date.now(),
              identifier: ident,
              name: selectedConv.customerName,
              platform: selectedConv.platform,
              reason: 'কন্টাক্ট কার্ড থেকে এআই রিপ্লাই নিষিদ্ধ করা হয়েছে',
              addedAt: new Date().toISOString()
            }
          ];
        }
      } else {
        const phone = selectedConv.customerPhone?.replace(/[^0-9]/g, '');
        const ident = selectedConv.customerPhone || selectedConv.customerHandle || selectedConv.id;
        updated = prev.filter(item => {
          const itemNum = item.identifier.replace(/[^0-9]/g, '');
          if (phone && itemNum && phone === itemNum) return false;
          if (item.identifier === ident) return false;
          return true;
        });
      }
      try { localStorage.setItem('omni_ai_excluded_contacts', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setStatusMessage({
      type: nextState ? 'error' : 'success',
      text: nextState
        ? `🚫 ${selectedConv.customerName}-এর জন্য এআই রিপ্লাই বন্ধ করা হয়েছে!`
        : `✅ ${selectedConv.customerName}-এর জন্য এআই রিপ্লাই সক্রিয় করা হয়েছে!`
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleAddManualExclusion = () => {
    if (!newExcludedInput.trim()) return;
    const ident = newExcludedInput.trim();
    const newEx: ExcludedContact = {
      id: 'ex_' + Date.now(),
      identifier: ident,
      name: newExcludedName.trim() || ident,
      platform: newExcludedPlatform,
      reason: newExcludedReason.trim() || 'ম্যানুয়াল ব্যতিক্রম তালিকাভুক্ত',
      addedAt: new Date().toISOString()
    };
    const updated = [...excludedContacts, newEx];
    setExcludedContacts(updated);
    try { localStorage.setItem('omni_ai_excluded_contacts', JSON.stringify(updated)); } catch {}

    setNewExcludedInput('');
    setNewExcludedName('');
    setNewExcludedReason('');
    setStatusMessage({ type: 'success', text: `🚫 "${ident}" এআই ব্যতিক্রম তালিকায় যোগ করা হয়েছে!` });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleRemoveExclusion = (id: string) => {
    const updated = excludedContacts.filter(e => e.id !== id);
    setExcludedContacts(updated);
    try { localStorage.setItem('omni_ai_excluded_contacts', JSON.stringify(updated)); } catch {}
    setStatusMessage({ type: 'success', text: '✅ ব্যতিক্রম তালিকা থেকে সরানো হয়েছে (এআই চালু করা যাবে)!' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleTestApiKeyConnection = async () => {
    setIsTestingKey(true);
    setKeyTestStatus(null);
    const [chosenProv, chosenMod] = activeAiBotModel.split(':');
    try {
      const res = await fetch('/api/ai/omnichannel-agent-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'আসসালামু আলাইকুম, টেস্ট মেসেজ',
          customerName: 'Customer Test',
          platform: 'whatsapp',
          provider: chosenProv || 'gemini',
          model: chosenMod || 'gemini-2.5-flash',
          tone: aiTone,
          openaiApiKey: openAiKeyInput,
          geminiApiKey: geminiKeyInput,
          deepseekApiKey: deepseekKeyInput,
          claudeApiKey: claudeKeyInput,
          apiKey: geminiKeyInput,
          customInstructions: customAiPrompt,
          storeContext: customStoreContext
        })
      });
      const data = await res.json();
      if (data.reply) {
        setKeyTestStatus(`🟢 সংযোগ সফল (${data.provider || chosenProv}): "${data.reply.slice(0, 48)}..."`);
      } else {
        setKeyTestStatus(`⚠️ কোনো রেসপন্স পাওয়া যায়নি: ${data.error || 'Check key'}`);
      }
    } catch (e: any) {
      setKeyTestStatus(`❌ সংযোগ ব্যর্থ: ${e.message}`);
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveAiConfig = () => {
    localStorage.setItem('omni_master_ai_reply_enabled', String(masterAiReplyEnabled));
    localStorage.setItem('omni_ai_enabled_platforms', JSON.stringify(aiEnabledPlatforms));
    localStorage.setItem('omni_ai_excluded_contacts', JSON.stringify(excludedContacts));
    localStorage.setItem('omni_active_bot_model', activeAiBotModel);
    localStorage.setItem('omni_ai_reply_mode', aiReplyMode);
    localStorage.setItem('omni_ai_tone', aiTone);
    localStorage.setItem('omni_custom_ai_prompt', customAiPrompt);
    localStorage.setItem('omni_custom_store_context', customStoreContext);

    // Sync selected bot model & BYOK Keys with global app_ai_config
    try {
      const storedAi = localStorage.getItem('app_ai_config');
      const parsed = storedAi ? JSON.parse(storedAi) : {};
      const [prov, mod] = activeAiBotModel.split(':');
      parsed.taskRouting = parsed.taskRouting || {};
      parsed.taskRouting.whatsappBot = prov;
      if (openAiKeyInput) parsed.openaiApiKey = openAiKeyInput;
      if (geminiKeyInput) parsed.geminiApiKey = geminiKeyInput;
      if (deepseekKeyInput) parsed.deepseekApiKey = deepseekKeyInput;
      if (claudeKeyInput) parsed.claudeApiKey = claudeKeyInput;
      if (prov === 'gemini') parsed.geminiModel = mod;
      if (prov === 'openai') parsed.openaiModel = mod;
      if (prov === 'claude') parsed.claudeModel = mod;
      if (prov === 'deepseek') parsed.deepseekModel = mod;
      localStorage.setItem('app_ai_config', JSON.stringify(parsed));
    } catch (e) {}

    setShowAiConfigModal(false);
    setStatusMessage({ type: 'success', text: '✨ এআই অমনিচ্যানেল সেটিংস ও এপিআই কনফিগারেশন সংরক্ষিত হয়েছে!' });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('ফাইলের সাইজ ১৫ মেগাবাইট বা তার কম হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const mime = file.type;
      const isImg = mime.startsWith('image/');
      const isVid = mime.startsWith('video/');
      const type: 'image' | 'video' | 'document' = isImg ? 'image' : isVid ? 'video' : 'document';

      setSelectedAttachment({
        dataUrl,
        name: file.name,
        type,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      });
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle instant seen / read state on selecting conversation
  const handleSelectConversation = async (conv: OmniConversation) => {
    setSelectedConvId(conv.id);
    if (conv.unreadCount > 0) {
      const updated = { ...conv, unreadCount: 0 };
      setConversations(prev => prev.map(c => c.id === conv.id ? updated : c));
      try {
        await fetch('/api/omni/mark-as-read', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId: conv.id })
        });
        await saveOmniConversation(updated);
      } catch (e) {}
    }
  };

  // Sync WhatsApp Groups and real active chats from Baileys Socket
  const handleSyncWhatsAppGroups = async () => {
    setIsSyncingGroups(true);
    try {
      const res = await fetch('/api/whatsapp/sync-groups-and-chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({
          type: 'success',
          text: `🎉 ${data.message}`
        });
        await syncLiveConversationsAndChannels();
      } else {
        setStatusMessage({
          type: 'error',
          text: `⚠️ ${data.error || 'WhatsApp সিঙ্ক করা যায়নি। WhatsApp কানেক্টেড আছে কিনা চেক করুন।'}`
        });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `সিঙ্ক এরর: ${err.message}` });
    } finally {
      setIsSyncingGroups(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Clear demo mock conversations
  const handleClearDemoData = async () => {
    if (!confirm('আপনি কি ডেমো টেস্ট চ্যাটগুলো মুছে শুধুমাত্র আসল কানেক্টেড চ্যাট রাখতে চান?')) return;
    try {
      const res = await fetch('/api/omni/clear-demo-conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: '✅ ডেমো চ্যাট সরানো হয়েছে। এখন শুধু রিয়েল চ্যাট দেখাচ্ছে।' });
        await syncLiveConversationsAndChannels();
      }
    } catch (e) {}
  };

  // Start New Chat / Send to any phone number
  const handleStartNewChat = async () => {
    if (!newChatPhone.trim() || !newChatMessage.trim()) {
      alert('অনুগ্রহ করে ফোন নম্বর এবং মেসেজ লিখুন।');
      return;
    }
    setIsStartingNewChat(true);
    try {
      const res = await fetch('/api/omni/start-new-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'whatsapp',
          recipient: newChatPhone.trim(),
          message: newChatMessage.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: `🚀 ${data.message}` });
        setShowNewChatModal(false);
        setNewChatPhone('');
        setNewChatMessage('');
        await syncLiveConversationsAndChannels();
        if (data.conversation?.id) {
          setSelectedConvId(data.conversation.id);
        }
      } else {
        alert(data.error || 'মেসেজ পাঠানো যায়নি।');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setIsStartingNewChat(false);
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  // Filter Conversations (Includes Direct DM / Group / Channel distinctions)
  const filteredConversations = conversations.filter(c => {
    // Only Connected channels filter
    if (onlyConnectedFilter) {
      const isConn = channelStatus[c.platform]?.isConnected;
      if (!isConn) return false;
    }

    let matchesPlatform = true;
    if (selectedPlatformFilter === 'all') {
      matchesPlatform = true;
    } else if (selectedPlatformFilter === 'direct_only') {
      matchesPlatform = c.chatType === 'direct' || (!c.chatType && !c.id.includes('group') && !c.id.includes('newsletter'));
    } else if (selectedPlatformFilter === 'group_only') {
      matchesPlatform = c.chatType === 'group' || c.id.includes('group') || c.id.includes('@g.us');
    } else if (selectedPlatformFilter === 'channel_only') {
      matchesPlatform = c.chatType === 'channel' || c.id.includes('newsletter');
    } else if (selectedPlatformFilter === 'handover') {
      matchesPlatform = Boolean(c.isHandover);
    } else {
      matchesPlatform = c.platform === selectedPlatformFilter;
    }

    const matchesSearch = c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.customerPhone && c.customerPhone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.customerHandle && c.customerHandle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesPlatform && matchesSearch;
  });

  // Handle Human Agent Send Message with 100% Real Live 2-Way Dispatch (Text & Rich Media)
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if ((!text && !selectedAttachment) || !selectedConv) return;

    const attachmentCopy = selectedAttachment;
    setSelectedAttachment(null);
    setInputText('');

    const displayMsgText = text || (attachmentCopy ? `[সংযুক্ত ফাইল: ${attachmentCopy.name}]` : '');

    const newMessage: OmniMessage = {
      id: 'msg_' + Date.now(),
      conversationId: selectedConv.id,
      sender: 'agent',
      senderName: 'You (Human Agent)',
      text: displayMsgText,
      mediaUrl: attachmentCopy?.dataUrl,
      timestamp: new Date().toISOString()
    };

    const updatedConv: OmniConversation = {
      ...selectedConv,
      lastMessage: displayMsgText,
      lastMessageTime: newMessage.timestamp,
      unreadCount: 0,
      messages: [...selectedConv.messages, newMessage]
    };

    // 1. Save to local/cloud database
    await saveOmniConversation(updatedConv);

    // 2. Real-Time 2-Way Live API Dispatch to connected platform
    try {
      const res = await fetch('/api/omni/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          platform: selectedConv.platform,
          recipientHandle: selectedConv.customerHandle,
          text: displayMsgText,
          senderName: 'You (Human Agent)',
          mediaUrl: attachmentCopy?.dataUrl,
          mediaType: attachmentCopy?.type,
          fileName: attachmentCopy?.name
        })
      });
      const data = await res.json();
      if (data.success && data.dispatchOutcome?.isLiveDispatched) {
        setStatusMessage({
          type: 'success',
          text: `🚀 ${data.dispatchOutcome.details}`
        });
        setTimeout(() => setStatusMessage(null), 3500);
      }
    } catch (dispatchErr: any) {
      console.warn('Real dispatch error:', dispatchErr);
    }
  };

  // Toggle Auto-Pilot Mode for selected conversation
  const handleToggleAutoPilot = async () => {
    if (!selectedConv) return;
    const updated: OmniConversation = {
      ...selectedConv,
      autoPilotEnabled: !selectedConv.autoPilotEnabled
    };
    await saveOmniConversation(updated);
    setStatusMessage({
      type: 'success',
      text: updated.autoPilotEnabled
        ? '🤖 AI Auto-Pilot Mode Activated (২৪/৭ স্বয়ংক্রিয় উত্তর দেবে)'
        : '👨‍💼 AI Auto-Pilot Paused (ম্যানুয়াল কন্ট্রোল)'
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Toggle Handover Flag
  const handleToggleHandover = async () => {
    if (!selectedConv) return;
    const updated: OmniConversation = {
      ...selectedConv,
      isHandover: !selectedConv.isHandover,
      handoverReason: !selectedConv.isHandover ? 'Manual Human Handover Flag' : undefined
    };
    await saveOmniConversation(updated);
    setStatusMessage({
      type: 'success',
      text: updated.isHandover ? 'হ্যান্ডওভার ফ্ল্যাগ যুক্ত করা হয়েছে' : 'হ্যান্ডওভার সমাধান হয়েছে'
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Trigger AI Suggestion / Auto-Pilot with Custom Knowledge, Platform filter & Exclusion checks
  const handleGenerateAiResponse = async () => {
    if (!selectedConv || selectedConv.messages.length === 0) return;

    if (!masterAiReplyEnabled) {
      setStatusMessage({
        type: 'error',
        text: '⚠️ মাস্টার এআই অটো-রিপ্লাই নিষ্ক্রিয় রয়েছে! "এআই সেটিংস" থেকে চালু করুন।'
      });
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    if (!aiEnabledPlatforms[selectedConv.platform]) {
      setStatusMessage({
        type: 'error',
        text: `⚠️ ${selectedConv.platform.toUpperCase()} চ্যানেলের জন্য এআই রিপ্লাই বন্ধ রাখা হয়েছে! "এআই সেটিংস" থেকে চালু করুন।`
      });
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    if (isConvAiExcluded(selectedConv)) {
      const proceed = confirm(`⚠️ "${selectedConv.customerName}" এআই ব্যতিক্রম তালিকায় অন্তর্ভুক্ত (এআই বন্ধ রাখা আছে)। আপনি কি তা সত্ত্বেও এই মেসেজের জন্য এআই উত্তর তৈরি করতে চান?`);
      if (!proceed) return;
    }

    const lastCustomerMsg = [...selectedConv.messages].reverse().find(m => m.sender === 'customer');
    if (!lastCustomerMsg) {
      alert('কোনো কাস্টমার মেসেজ পাওয়া যায়নি।');
      return;
    }

    setIsAiTyping(true);

    const [chosenProv, chosenMod] = activeAiBotModel.split(':');
    let aiConfigPayload: any = {
      provider: chosenProv || 'gemini',
      model: chosenMod || 'gemini-2.5-flash',
      tone: aiTone,
      openaiApiKey: openAiKeyInput,
      geminiApiKey: geminiKeyInput,
      deepseekApiKey: deepseekKeyInput,
      claudeApiKey: claudeKeyInput,
      apiKey: geminiKeyInput
    };

    try {
      const storedAi = localStorage.getItem('app_ai_config');
      if (storedAi) {
        const parsed = JSON.parse(storedAi);
        if (!aiConfigPayload.openaiApiKey && parsed.openaiApiKey) aiConfigPayload.openaiApiKey = parsed.openaiApiKey;
        if (!aiConfigPayload.claudeApiKey && parsed.claudeApiKey) aiConfigPayload.claudeApiKey = parsed.claudeApiKey;
        if (!aiConfigPayload.deepseekApiKey && parsed.deepseekApiKey) aiConfigPayload.deepseekApiKey = parsed.deepseekApiKey;
        if (!aiConfigPayload.apiKey && parsed.geminiApiKey) aiConfigPayload.apiKey = parsed.geminiApiKey;
      }
    } catch (e) {}

    try {
      const res = await fetch('/api/ai/omnichannel-agent-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: lastCustomerMsg.text,
          customerName: selectedConv.customerName,
          platform: selectedConv.platform,
          chatHistory: selectedConv.messages.slice(-6),
          customInstructions: customAiPrompt,
          storeContext: customStoreContext,
          ...aiConfigPayload
        })
      });
      const data = await res.json();

      // If user selected Draft Review Mode, write into composer rather than auto-sending
      if (aiReplyMode === 'draft_review') {
        setInputText(data.reply || '');
        setStatusMessage({
          type: 'success',
          text: `✏️ এআই উত্তরটি ইনপুট বক্সে ড্রাফট হিসেবে যোগ করা হয়েছে! প্রয়োজনমতো এডিট করে "পাঠান" চাপুন।`
        });
        setTimeout(() => setStatusMessage(null), 4000);
        return;
      }
      
      const aiMessage: OmniMessage = {
        id: 'msg_ai_' + Date.now(),
        conversationId: selectedConv.id,
        sender: 'ai_bot',
        senderName: chosenProv === 'openai' ? 'OpenAI GPT-4o-mini' : chosenProv === 'claude' ? 'Claude AI Bot' : chosenProv === 'deepseek' ? 'DeepSeek Chat' : 'Smart AI Support Agent',
        text: data.reply || 'ধন্যবাদ! আপনার মেসেজটি পেয়েছি।',
        timestamp: new Date().toISOString(),
        isAiGenerated: true,
        intent: data.intent
      };

      const updatedConv: OmniConversation = {
        ...selectedConv,
        lastMessage: aiMessage.text,
        lastMessageTime: aiMessage.timestamp,
        unreadCount: 0,
        isHandover: data.isHandover || selectedConv.isHandover,
        handoverReason: data.isHandover ? 'এআই জটিল জিজ্ঞাসা বা অভিযোগ শনাক্ত করেছে' : selectedConv.handoverReason,
        messages: [...selectedConv.messages, aiMessage]
      };

      await saveOmniConversation(updatedConv);
      setConversations(prev => prev.map(c => c.id === selectedConv.id ? updatedConv : c));

      setStatusMessage({
        type: 'success',
        text: `⚡ এআই স্বয়ংক্রিয় উত্তর সফলভাবে তৈরি ও পাঠানো হয়েছে (${chosenProv === 'openai' ? 'OpenAI GPT-4o-mini' : chosenProv === 'claude' ? 'Claude' : chosenProv === 'deepseek' ? 'DeepSeek' : 'Gemini Flash'})!`
      });
      setTimeout(() => setStatusMessage(null), 3500);

      // Auto-dispatch AI message if autoPilot is enabled and NOT excluded
      if (selectedConv.autoPilotEnabled && !isConvAiExcluded(selectedConv) && selectedConv.platform === 'whatsapp') {
        try {
          await fetch('/api/omni/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: selectedConv.id,
              platform: selectedConv.platform,
              recipientHandle: selectedConv.customerHandle,
              text: aiMessage.text,
              senderName: 'AI Support Auto-Pilot'
            })
          });
        } catch (e) {}
      }
    } catch (err: any) {
      console.error('AI Support Agent Error:', err);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Simulate Incoming Message from a customer
  const handleSimulateIncomingMessage = async () => {
    if (!simText.trim()) return;

    const convId = 'conv_sim_' + Date.now();
    const customerMsg: OmniMessage = {
      id: 'msg_' + Date.now(),
      conversationId: convId,
      sender: 'customer',
      senderName: simCustomerName,
      text: simText,
      timestamp: new Date().toISOString()
    };

    const newConv: OmniConversation = {
      id: convId,
      customerName: simCustomerName,
      customerHandle: '@' + simCustomerName.toLowerCase().replace(/\s+/g, '.'),
      customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60',
      platform: simPlatform,
      lastMessage: simText,
      lastMessageTime: customerMsg.timestamp,
      unreadCount: 1,
      autoPilotEnabled: true,
      isHandover: false,
      status: 'active',
      messages: [customerMsg]
    };

    await saveOmniConversation(newConv);
    setSelectedConvId(convId);
    setShowSimulateModal(false);

    // If Auto-Pilot is enabled, trigger instant AI response after 1.2s
    setTimeout(async () => {
      try {
        const res = await fetch('/api/ai/omnichannel-agent-reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: simText,
            customerName: simCustomerName,
            platform: simPlatform,
            chatHistory: [customerMsg]
          })
        });
        const data = await res.json();

        const aiMsg: OmniMessage = {
          id: 'msg_ai_' + Date.now(),
          conversationId: convId,
          sender: 'ai_bot',
          senderName: 'Smart AI Support Agent',
          text: data.reply,
          timestamp: new Date().toISOString(),
          isAiGenerated: true,
          intent: data.intent
        };

        const finalConv: OmniConversation = {
          ...newConv,
          lastMessage: aiMsg.text,
          lastMessageTime: aiMsg.timestamp,
          unreadCount: 0,
          isHandover: data.isHandover,
          handoverReason: data.isHandover ? 'AI Handover Triggered' : undefined,
          messages: [customerMsg, aiMsg]
        };
        await saveOmniConversation(finalConv);
      } catch (e) {
        console.warn('Simulation AI reply error:', e);
      }
    }, 1200);
  };

  const getPlatformIcon = (platform: SocialPlatformId) => {
    switch (platform) {
      case 'facebook': return <Facebook className="w-3.5 h-3.5 text-blue-600" />;
      case 'instagram': return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
      case 'tiktok': return <Music2 className="w-3.5 h-3.5 text-slate-900 dark:text-white" />;
      case 'youtube': return <Youtube className="w-3.5 h-3.5 text-red-600" />;
      case 'telegram': return <Send className="w-3.5 h-3.5 text-sky-500" />;
      case 'whatsapp': return <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />;
      default: return <MessageSquare className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* 1. Global Social Media & WhatsApp Top Tab Navigation Bar */}
        <SocialMediaTopNav activeTab="omnichannel_inbox" />

        {/* Top Header & Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                <MessageSquare className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Omnichannel Inbox & AI Agent
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                    24/7 AI Live
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  ফেসবুক, ইনস্টাগ্রাম, টিকটক, টেলিগ্রাম ও হোয়াটসঅ্যাপের সব কাস্টমার চ্যাট এক সেন্ট্রাল ইনবক্সে এআই দ্বারা ম্যানেজ করুন।
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { syncLiveConversationsAndChannels(true); }}
              disabled={isSyncingChannels}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5"
              title="Sync fresh incoming messages from WhatsApp, Telegram & Meta"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-purple-600 ${isSyncingChannels ? 'animate-spin' : ''}`} />
              <span>{isSyncingChannels ? 'সিঙ্ক হচ্ছে...' : '🔄 সিঙ্ক লাইভ চ্যাট'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowYtHubModal(true);
                fetchYtComments();
                fetchYtLiveChat();
              }}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
            >
              <Youtube className="w-3.5 h-3.5" />
              🔴 YouTube Hub
            </button>
            <button
              type="button"
              onClick={() => setShowSimulateModal(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              + টেস্ট মেসেজ তৈরি করুন
            </button>
          </div>
        </div>

        {/* Live Channel Connection Badges Bar */}
        <div className="bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>লাইভ চ্যানেল স্ট্যাটাস:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* WhatsApp */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold ${
              channelStatus.whatsapp?.isConnected
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}>
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp:</span>
              <span className="font-bold">{channelStatus.whatsapp?.isConnected ? `Connected (${channelStatus.whatsapp.phone || 'Active'})` : 'Disconnected'}</span>
              <span className={`w-2 h-2 rounded-full ${channelStatus.whatsapp?.isConnected ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
            </div>

            {/* Telegram */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold ${
              channelStatus.telegram?.isConnected
                ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 text-sky-700 dark:text-sky-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}>
              <Send className="w-3.5 h-3.5 text-sky-500" />
              <span>Telegram:</span>
              <span className="font-bold">{channelStatus.telegram?.isConnected ? 'Active Bot/User' : 'Not Connected'}</span>
            </div>

            {/* Facebook & Instagram */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-semibold ${
              channelStatus.facebook?.isConnected
                ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 text-blue-700 dark:text-blue-300'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}>
              <Facebook className="w-3.5 h-3.5 text-blue-600" />
              <Instagram className="w-3.5 h-3.5 text-pink-600" />
              <span>Meta Pages:</span>
              <span className="font-bold">{channelStatus.facebook?.isConnected ? 'Ready' : 'Setup Token'}</span>
            </div>

            {/* TikTok */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-500">
              <Music2 className="w-3.5 h-3.5" />
              <span>TikTok:</span>
              <span>{channelStatus.tiktok?.isConnected ? 'Connected' : 'Standby'}</span>
            </div>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* 3-COLUMN INBOX WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[750px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          
          {/* COLUMN 1: Conversations List & Channels (4 cols) */}
          <div className="lg:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/40 dark:bg-slate-900/40">
            
            {/* Search & Actions Bar */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="কাস্টমার নাম, ফোন নম্বর বা মেসেজ সার্চ করুন..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              {/* Quick Actions for WhatsApp & Filters */}
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(true)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ নতুন চ্যাট</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncWhatsAppGroups}
                  disabled={isSyncingGroups}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-all"
                  title="হোয়াটসঅ্যাপের সব গ্রুপ ও কন্টাক্ট সরাসরি সিঙ্ক করুন"
                >
                  <RefreshCw className={`w-3 h-3 text-emerald-600 ${isSyncingGroups ? 'animate-spin' : ''}`} />
                  <span>{isSyncingGroups ? 'সিঙ্ক...' : 'গ্রুপ সিঙ্ক'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearDemoData}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="ডেমো টেস্ট মেসেজগুলো মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Connected Filter & Platform Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold no-scrollbar">
                <button
                  type="button"
                  onClick={() => setOnlyConnectedFilter(!onlyConnectedFilter)}
                  className={`px-2 py-1 rounded-lg text-[10px] whitespace-nowrap transition-all flex items-center gap-1 border ${
                    onlyConnectedFilter
                      ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                  title="শুধুমাত্র সক্রিয় ও কানেক্টেড সোশ্যাল চ্যানেলগুলো দেখান"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${onlyConnectedFilter ? 'bg-white' : 'bg-emerald-500'}`} />
                  <span>কানেক্টেড শুধু</span>
                </button>

                {[
                  { id: 'all', label: 'সব চ্যানেল' },
                  { id: 'direct_only', label: '👤 শুধু পার্সোনাল' },
                  { id: 'group_only', label: '👥 শুধু গ্রুপ' },
                  { id: 'channel_only', label: '📢 চ্যানেল' },
                  { id: 'whatsapp', label: 'WhatsApp' },
                  { id: 'telegram', label: 'Telegram' },
                  { id: 'facebook', label: 'Facebook' },
                  { id: 'instagram', label: 'Instagram' },
                  { id: 'youtube', label: 'YouTube' },
                  { id: 'tiktok', label: 'TikTok' },
                  { id: 'handover', label: '⚠️ Handover' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedPlatformFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                      selectedPlatformFilter === tab.id
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Items List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                  <p>কোনো মেসেজ পাওয়া যায়নি।</p>
                  <button
                    type="button"
                    onClick={() => setShowNewChatModal(true)}
                    className="text-[11px] text-emerald-600 font-bold hover:underline"
                  >
                    + নতুন চ্যাট শুরু করুন
                  </button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConv?.id === conv.id;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 ${
                        isSelected
                          ? 'bg-purple-50/80 dark:bg-purple-950/40 border-l-4 border-purple-600'
                          : ''
                      }`}
                    >
                      {/* Avatar with Platform Badge */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={conv.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                          alt={conv.customerName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-slate-900 shadow-xs">
                          {getPlatformIcon(conv.platform)}
                        </span>
                      </div>

                      {/* Info & Snippet */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate flex items-center gap-1">
                            <span>{conv.customerName}</span>
                          </h4>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono font-medium">
                            {new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Phone & Chat Type Badges */}
                        <div className="flex items-center gap-1.5 my-1 flex-wrap">
                          {conv.customerPhone && (
                            <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1 shadow-2xs">
                              <Phone className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>{conv.customerPhone}</span>
                            </span>
                          )}
                          <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border ${
                            conv.chatType === 'group'
                              ? 'bg-amber-100/80 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800'
                              : conv.chatType === 'channel'
                              ? 'bg-sky-100/80 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200 border-sky-300 dark:border-sky-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}>
                            {conv.chatType === 'group' ? '👥 গ্রুপ' : conv.chatType === 'channel' ? '📢 চ্যানেল' : '👤 ডিরেক্ট DM'}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5 font-normal">
                          {conv.lastMessage}
                        </p>

                        {/* Status Badges */}
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {conv.autoPilotEnabled && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-0.5">
                              <Bot className="w-2.5 h-2.5" />
                              Auto-Pilot
                            </span>
                          )}
                          {conv.isHandover && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-0.5">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              Handover
                            </span>
                          )}
                          {conv.unreadCount > 0 && (
                            <span className="ml-auto w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs animate-pulse">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* COLUMN 2: Main Active Chat Screen (5 cols) */}
          {selectedConv ? (
            <div className="lg:col-span-5 flex flex-col h-full bg-white dark:bg-slate-900">
              
              {/* Chat Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={selectedConv.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                    alt={selectedConv.customerName}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {selectedConv.customerName}
                      </h3>
                      {selectedConv.customerPhone && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5" />
                          {selectedConv.customerPhone}
                        </span>
                      )}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        selectedConv.chatType === 'group'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : selectedConv.chatType === 'channel'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {selectedConv.chatType === 'group' ? '👥 WhatsApp Group' : selectedConv.chatType === 'channel' ? '📢 Channel' : '👤 Direct DM'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1">
                        {getPlatformIcon(selectedConv.platform)}
                        {selectedConv.platform}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-400 truncate max-w-[180px]">
                        {selectedConv.customerHandle || selectedConv.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  {/* Specific Contact AI Exclusion 1-Click Toggle */}
                  <button
                    type="button"
                    onClick={handleToggleExcludeCurrentConv}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 border shadow-2xs ${
                      isConvAiExcluded(selectedConv)
                        ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                    title={isConvAiExcluded(selectedConv) ? 'এই নির্দিষ্ট ব্যক্তির জন্য এআই রিপ্লাই বন্ধ আছে (ক্লিক করে চালু করুন)' : 'এই কন্টাক্টের মেসেজে এআই উত্তর দিতে পারে (ক্লিক করে বন্ধ করুন)'}
                  >
                    {isConvAiExcluded(selectedConv) ? (
                      <>
                        <UserX className="w-3.5 h-3.5 text-rose-600" />
                        <span className="hidden sm:inline">🚫 নির্দিষ্ট ব্যক্তি: এআই বন্ধ</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">🤖 কন্টাক্ট এআই চালু</span>
                      </>
                    )}
                  </button>

                  {/* Channel AI On/Off Quick Switch */}
                  <button
                    type="button"
                    onClick={() => {
                      const cur = aiEnabledPlatforms[selectedConv.platform];
                      const next = !cur;
                      const updated = { ...aiEnabledPlatforms, [selectedConv.platform]: next };
                      setAiEnabledPlatforms(updated);
                      localStorage.setItem('omni_ai_enabled_platforms', JSON.stringify(updated));
                      setStatusMessage({
                        type: next ? 'success' : 'error',
                        text: next
                          ? `✅ ${selectedConv.platform.toUpperCase()} চ্যানেলে এআই রিপ্লাই চালু করা হয়েছে!`
                          : `🚫 ${selectedConv.platform.toUpperCase()} চ্যানেলে এআই রিপ্লাই বন্ধ করা হয়েছে!`
                      });
                      setTimeout(() => setStatusMessage(null), 3000);
                    }}
                    className={`px-2 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                      aiEnabledPlatforms[selectedConv.platform]
                        ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800'
                    }`}
                    title={`এই চ্যানেলে (${selectedConv.platform}) এআই রিপ্লাই চালু বা বন্ধ করুন`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${aiEnabledPlatforms[selectedConv.platform] ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span className="hidden md:inline uppercase">{selectedConv.platform}:</span>
                    <span>{aiEnabledPlatforms[selectedConv.platform] ? 'অন' : 'অফ'}</span>
                  </button>

                  {/* Active Model Pill -> Opens AI Settings */}
                  <button
                    type="button"
                    onClick={() => setShowAiConfigModal(true)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1"
                    title="এআই চ্যাটবট মডেল ও সেটিংস খুলুন"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-600" />
                    <span className="font-mono text-[11px]">
                      {activeAiBotModel.includes('openai') ? 'GPT-4o-mini' : activeAiBotModel.includes('claude') ? 'Claude' : activeAiBotModel.includes('deepseek') ? 'DeepSeek' : 'Gemini Flash'}
                    </span>
                  </button>

                  {selectedConv.customerPhone && (
                    <a
                      href={`https://wa.me/${selectedConv.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1 transition-all"
                      title="Open in WhatsApp Web"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={handleToggleAutoPilot}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1 ${
                      selectedConv.autoPilotEnabled
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{selectedConv.autoPilotEnabled ? 'Auto-Pilot ON' : 'Auto-Pilot OFF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleHandover}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      selectedConv.isHandover
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800'
                    }`}
                    title="Toggle Handover Flag"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Handover Alert Notice Banner */}
              {selectedConv.isHandover && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-800/80 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span><strong>Human Support Handover Requested:</strong> {selectedConv.handoverReason || 'কাস্টমার একজন প্রতিনিধির সাথে কথা বলতে চেয়েছেন।'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleHandover}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100"
                  >
                    Mark Handled
                  </button>
                </div>
              )}

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20 dark:bg-slate-950/20">
                {selectedConv.messages.map((msg) => {
                  const isCustomer = msg.sender === 'customer';
                  const isAi = msg.sender === 'ai_bot';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 px-1">
                        <span className="font-bold text-slate-600 dark:text-slate-300">{msg.senderName}</span>
                        {msg.senderPhone && (
                          <span className="font-mono text-[9px] text-emerald-600">({msg.senderPhone})</span>
                        )}
                        {isAi && (
                          <span className="px-1 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> AI Auto-Reply
                          </span>
                        )}
                        <span>• {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                          isCustomer
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none border border-slate-200 dark:border-slate-700'
                            : isAi
                            ? 'bg-purple-600 text-white rounded-tr-none shadow-xs'
                            : 'bg-emerald-600 text-white rounded-tr-none shadow-xs'
                        }`}
                      >
                        {/* Render Media if attached */}
                        {msg.mediaUrl && (
                          <div className="mb-2 rounded-xl overflow-hidden bg-black/10 max-w-sm">
                            {msg.mediaUrl.startsWith('data:image') || msg.mediaUrl.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                              <img
                                src={msg.mediaUrl}
                                alt="Attachment"
                                className="w-full max-h-60 object-cover cursor-pointer hover:opacity-95"
                                onClick={() => window.open(msg.mediaUrl, '_blank')}
                              />
                            ) : msg.mediaUrl.startsWith('data:video') || msg.mediaUrl.match(/\.(mp4|webm|mov)/i) ? (
                              <video controls className="w-full max-h-60">
                                <source src={msg.mediaUrl} />
                              </video>
                            ) : (
                              <div className="p-2.5 flex items-center gap-2 text-[11px] bg-white/10 rounded-lg">
                                <Paperclip className="w-4 h-4" />
                                <span className="truncate">সংযুক্ত ডকুমেন্ট / ফাইল</span>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}

                {/* AI Typing Indicator */}
                {isAiTyping && (
                  <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 p-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini AI Support Agent উত্তর লিখছে...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input & Live Dispatch Controls */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
                {/* Live Dispatch Target Indicator */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      লাইভ ডেলিভারি টার্গেট:
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {selectedConv.platform.toUpperCase()} {selectedConv.customerPhone || selectedConv.customerName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Enter = সরাসরি পাঠান
                  </span>
                </div>

                {/* Selected File / Media Attachment Preview Box */}
                {selectedAttachment && (
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {selectedAttachment.type === 'image' ? (
                        <img src={selectedAttachment.dataUrl} alt="Preview" className="w-9 h-9 rounded-lg object-cover" />
                      ) : (
                        <div className="p-2 rounded-lg bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          <Paperclip className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{selectedAttachment.name}</p>
                        <p className="text-[10px] text-slate-400">{selectedAttachment.type.toUpperCase()} • {selectedAttachment.size}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAttachment(null)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,video/*,application/pdf,.doc,.docx"
                  className="hidden"
                />

                <div className="flex items-end gap-2">
                  {/* File Attachment Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="ছবি, ভিডিও বা ডকুমেন্ট ফাইল সংযুক্ত করুন"
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="মেসেজ লিখুন (ছবি, ভিডিও বা টেক্সট সরাসরি WhatsApp-এ যাবে)..."
                    rows={2}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-sans"
                  />
                  
                  {/* AI Suggest / Generate Reply Button with Mode Indicator */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleGenerateAiResponse}
                      disabled={isAiTyping}
                      title={`এআই উত্তর তৈরি করুন (${activeAiBotModel.includes('openai') ? 'OpenAI GPT-4o-mini' : activeAiBotModel.includes('claude') ? 'Claude' : activeAiBotModel.includes('deepseek') ? 'DeepSeek' : 'Gemini Flash'})`}
                      className={`p-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-2xs ${
                        isConvAiExcluded(selectedConv)
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300'
                          : isAiTyping
                          ? 'bg-purple-300 text-purple-900 cursor-wait'
                          : 'bg-purple-100 dark:bg-purple-900/60 hover:bg-purple-200 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      <Sparkles className={`w-4 h-4 ${isAiTyping ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline font-mono text-[11px]">
                        {isAiTyping ? 'তৈরি...' : (aiReplyMode === 'auto_send' ? '⚡ এআই রিপ্লাই' : '✏️ এআই ড্রাফট')}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const next = aiReplyMode === 'auto_send' ? 'draft_review' : 'auto_send';
                        setAiReplyMode(next);
                        localStorage.setItem('omni_ai_reply_mode', next);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title={aiReplyMode === 'auto_send' ? 'মোড: সরাসরি অটো-সেন্ড (ক্লিক করে ড্রাফট রিভিউ করুন)' : 'মোড: ড্রাফট রিভিউ (ক্লিক করে অটো-সেন্ড করুন)'}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>পাঠান</span>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="lg:col-span-5 flex items-center justify-center p-8 text-slate-400 text-xs">
              একটি চ্যাট নির্বাচন করুন।
            </div>
          )}

          {/* COLUMN 3: Customer Details & Contact Profile Card (3 cols) */}
          {selectedConv && (
            <div className="lg:col-span-3 border-l border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-slate-50/40 dark:bg-slate-900/40 overflow-y-auto">
              
              {/* Customer Profile Card */}
              <div className="text-center space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <img
                  src={selectedConv.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                  alt={selectedConv.customerName}
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-emerald-500 shadow-sm"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{selectedConv.customerName}</h3>
                  {selectedConv.customerPhone && (
                    <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {selectedConv.customerPhone}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px] mx-auto mt-0.5 font-mono">
                    {selectedConv.customerHandle || selectedConv.platform}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                    {getPlatformIcon(selectedConv.platform)}
                    {selectedConv.platform}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
                    {selectedConv.chatType === 'group' ? 'Group Chat' : 'Personal DM'}
                  </span>
                </div>
              </div>

              {/* Exact Details & Direct Action Box */}
              <div className="space-y-2.5 text-xs bg-white dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  যোগাযোগ ও প্রোফাইল তথ্য
                </p>

                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">ফোন নম্বর:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {selectedConv.customerPhone || 'Not available'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">চ্যাটের ধরন:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {selectedConv.chatType === 'group' ? 'গ্রুপ চ্যাট (Group)' : 'পার্সোনাল বার্তা (Personal)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">মোট মেসেজ:</span>
                    <span className="font-bold text-purple-600">
                      {selectedConv.messages.length} টি বার্তা
                    </span>
                  </div>
                </div>

                {selectedConv.customerPhone && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <a
                      href={`https://wa.me/${selectedConv.customerPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>WhatsApp অ্যাপে খুলুন</span>
                    </a>
                  </div>
                )}
              </div>

              {/* AI Autonomous Support Status & Behavior Control */}
              <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-purple-600" />
                    AI Support Assistant
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${masterAiReplyEnabled && aiEnabledPlatforms[selectedConv.platform] ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`} />
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {masterAiReplyEnabled ? (aiEnabledPlatforms[selectedConv.platform] ? '24/7 লাইভ' : `${selectedConv.platform} অফ`) : 'মাস্টার অফ'}
                    </span>
                  </div>
                </div>

                {/* Per-Contact AI Exclusion Control */}
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-purple-100 dark:border-purple-900/50 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {isConvAiExcluded(selectedConv) ? (
                        <>
                          <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                            <UserX className="w-3 h-3" /> এআই রিপ্লাই বন্ধ
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                            ব্যতিক্রম
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> এআই অনুমোদিত
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                            সক্রিয়
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {isConvAiExcluded(selectedConv)
                        ? 'এই কন্টাক্টকে এআই স্বয়ংক্রিয় উত্তর দেবে না'
                        : 'এই কন্টাক্টের মেসেজে এআই উত্তর দিতে পারবে'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleExcludeCurrentConv}
                    className={`px-2.5 py-1 text-[10.5px] font-bold rounded-lg transition-all shrink-0 flex items-center gap-1 ${
                      isConvAiExcluded(selectedConv)
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                    }`}
                    title="এই নির্দিষ্ট কন্টাক্টের জন্য এআই রিপ্লাই চালু বা বন্ধ করুন"
                  >
                    {isConvAiExcluded(selectedConv) ? 'এআই চালু করুন' : '🚫 এআই বন্ধ করুন'}
                  </button>
                </div>

                {/* Active Platform, Model & Mode Controls */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                  <span className="flex items-center gap-1">
                    <span>চ্যানেল: <strong>{selectedConv.platform}</strong></span>
                    {aiEnabledPlatforms[selectedConv.platform] ? (
                      <span className="text-emerald-600 font-bold">✓ অন</span>
                    ) : (
                      <span className="text-rose-500 font-bold">✕ অফ</span>
                    )}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">
                    {activeAiBotModel.includes('openai') ? '⚡ GPT-4o-mini' : activeAiBotModel.includes('claude') ? '⚡ Claude' : activeAiBotModel.includes('deepseek') ? '💰 DeepSeek' : '🟢 Gemini Flash (ফ্রি)'}
                  </span>
                </div>

                {/* AI Reply Mode Switch: Auto-Send vs Draft Review */}
                <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1 text-[10.5px]">
                  <span className="text-slate-600 dark:text-slate-300 font-bold">রিপ্লাই মোড:</span>
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        setAiReplyMode('auto_send');
                        localStorage.setItem('omni_ai_reply_mode', 'auto_send');
                      }}
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all ${
                        aiReplyMode === 'auto_send'
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title="মেসেজ আসলে বা ক্লিক করলে এআই সরাসরি উত্তর পাঠাবে"
                    >
                      ⚡ অটো-সেন্ড
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAiReplyMode('draft_review');
                        localStorage.setItem('omni_ai_reply_mode', 'draft_review');
                      }}
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all ${
                        aiReplyMode === 'draft_review'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                      title="এআই উত্তরটি ইনপুট বক্সে ড্রাফট হিসেবে লিখবে, যাতে আপনি দেখে নিশ্চিত হয়ে পাঠান"
                    >
                      ✏️ ড্রাফট রিভিউ
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleGenerateAiResponse}
                    disabled={isAiTyping}
                    className={`py-2 px-2.5 rounded-xl font-bold text-[11px] transition-colors flex items-center justify-center gap-1 shadow-xs ${
                      isConvAiExcluded(selectedConv)
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300'
                        : isAiTyping
                        ? 'bg-purple-400 text-white cursor-wait'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isAiTyping ? 'animate-spin' : ''}`} />
                    <span>{isAiTyping ? 'তৈরি হচ্ছে...' : (aiReplyMode === 'auto_send' ? 'এআই রিপ্লাই দিন' : 'এআই ড্রাফট তৈরি')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAiConfigModal(true)}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-600" />
                    <span>এআই সেটিংস</span>
                  </button>
                </div>
              </div>

              {/* Store Knowledge Fast Facts */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Store Knowledge Context
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAiConfigModal(true)}
                    className="text-[10px] text-purple-600 font-bold hover:underline"
                  >
                    এডিট করুন
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px]">
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {customStoreContext}
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* MODAL: SIMULATE INCOMING SOCIAL CHAT */}
        {showSimulateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  Simulate Live Incoming Message
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Customer Name:</label>
                  <input
                    type="text"
                    value={simCustomerName}
                    onChange={(e) => setSimCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Incoming Platform:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['facebook', 'instagram', 'youtube', 'whatsapp', 'telegram', 'tiktok'] as SocialPlatformId[]).map(pid => (
                      <button
                        key={pid}
                        type="button"
                        onClick={() => setSimPlatform(pid)}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                          simPlatform === pid
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {SOCIAL_PLATFORMS[pid].name.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Incoming Customer Question:</label>
                  <textarea
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSimulateIncomingMessage}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                >
                  Send & Trigger AI Auto-Pilot
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: YOUTUBE VIDEO COMMENTS & LIVE STREAM HUB */}
        {showYtHubModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full h-[88vh] max-h-[780px] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
                    <Youtube className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        YouTube Studio Hub (Comments & Live Stream)
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        100% Real Live Sync
                      </span>
                      {ytConfig.accessToken ? (
                        <button
                          type="button"
                          onClick={() => setShowYtOAuthModal(true)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1 hover:bg-emerald-600 transition-colors shadow-2xs"
                          title="YouTube OAuth 2.0 টোকেন সক্রিয় - ক্লিক করে পরিবর্তন করুন"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>OAuth Write Active</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowYtOAuthModal(true)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 animate-bounce transition-colors shadow-2xs"
                          title="YouTube-এ সরাসরি রিপ্লাই ও লাইক পাঠাতে OAuth কানেক্ট করুন"
                        >
                          <Key className="w-3 h-3" />
                          <span>কানেক্ট OAuth (Write Access)</span>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span>চ্যানেল:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{ytConfig.channelTitle || 'ChartLogic'}</strong>
                      <span className="text-slate-400">({ytConfig.channelHandle || '@chartlogic.trading'})</span>
                      {ytConfig.subscriberCount && (
                        <span className="px-1.5 py-0.2 text-[10px] rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {ytConfig.subscriberCount} Subs
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowYtOAuthModal(true)}
                        className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1 ml-1"
                      >
                        <Lock className="w-3 h-3" />
                        {ytConfig.accessToken ? 'OAuth কী পরিবর্তন করুন' : 'সরাসরি পোস্ট করতে OAuth টোকেন দিন'}
                      </button>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowYtOAuthModal(true)}
                    className="px-3 py-2 text-xs font-bold rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/80 shadow-xs flex items-center gap-1.5 transition-all"
                    title="Google OAuth 2.0 Access Token"
                  >
                    <Key className="w-3.5 h-3.5 text-red-600" />
                    <span>OAuth Token</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleManualRefreshYt}
                    disabled={loadingYt}
                    className="px-3 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                    title="Refresh & Sync YouTube API"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${loadingYt ? 'animate-spin text-red-600' : ''}`} />
                    <span>{loadingYt ? 'সিঙ্ক হচ্ছে...' : 'Refresh'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowYtHubModal(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Sub Navigation Tabs */}
              <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setYtActiveSubTab('comments')}
                  className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                    ytActiveSubTab === 'comments'
                      ? 'border-red-600 text-red-600 dark:text-red-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ভিডিও কমেন্টস ও রিপ্লাই</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${ytActiveSubTab === 'comments' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {ytComments.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setYtActiveSubTab('live_chat')}
                  className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                    ytActiveSubTab === 'live_chat'
                      ? 'border-red-600 text-red-600 dark:text-red-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Radio className={`w-4 h-4 ${ytLiveStatus.isStreamActive ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
                  <span>লাইভ স্ট্রিমিং লাইভ চ্যাট</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${ytLiveStatus.isStreamActive ? 'bg-red-600 text-white font-bold animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {ytLiveStatus.isStreamActive ? 'LIVE' : '0'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setYtActiveSubTab('auto_rules')}
                  className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                    ytActiveSubTab === 'auto_rules'
                      ? 'border-red-600 text-red-600 dark:text-red-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Bot className="w-4 h-4 text-purple-600" />
                  <span>YouTube AI অটো-রিপ্লাই রুলস</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${ytActiveSubTab === 'auto_rules' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {ytRules.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setYtActiveSubTab('cta_pin');
                    fetchChannelVideos();
                  }}
                  className={`pb-3 px-3.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                    ytActiveSubTab === 'cta_pin'
                      ? 'border-red-600 text-red-600 dark:text-red-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                  }`}
                >
                  <Pin className="w-4 h-4 text-amber-500" />
                  <span>কল টু অ্যাকশন ও পিন কমেন্ট</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${ytActiveSubTab === 'cta_pin' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    📌 CTA
                  </span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950">
                
                {/* 1. REAL VIDEO COMMENTS */}
                {ytActiveSubTab === 'comments' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
                      <span className="flex items-center gap-1.5">
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                        <span>কানেক্টেড চ্যানেল: <strong>{ytConfig.channelTitle || 'ChartLogic'}</strong> ({ytConfig.channelId})</span>
                      </span>
                      <span className="font-semibold text-emerald-600 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" /> রিয়েল-টাইম কমেন্ট সিঙ্ক অ্যাক্টিভ
                      </span>
                    </div>

                    {/* Filter Pills Bar for All / Live Stream / Uploads + CTA Creator Trigger */}
                    <div className="flex items-center justify-between gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setYtCommentFilter('all')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            ytCommentFilter === 'all'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Youtube className="w-3.5 h-3.5" />
                          <span>সকল কমেন্টস</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${ytCommentFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {ytComments.length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setYtCommentFilter('live')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            ytCommentFilter === 'live'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                          <span>লাইভ স্ট্রিম কমেন্ট</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${ytCommentFilter === 'live' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {ytComments.filter(c => c.isLiveStream || c.isCompletedLive || c.isLiveNow).length}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setYtCommentFilter('videos')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            ytCommentFilter === 'videos'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>আপলোড করা ভিডিও</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${ytCommentFilter === 'videos' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                            {ytComments.filter(c => !c.isLiveStream && !c.isCompletedLive && !c.isLiveNow).length}
                          </span>
                        </button>
                      </div>

                      {/* Prominent CTA Creator Button */}
                      <button
                        type="button"
                        onClick={() => {
                          fetchChannelVideos();
                          setShowCtaCreatorModal(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-linear-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>+ নতুন CTA কমেন্ট পোস্ট ও পিন করুন</span>
                      </button>
                    </div>

                    {loadingYt ? (
                      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                        <RotateCw className="w-8 h-8 text-red-600 animate-spin mx-auto" />
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          YouTube Data API v3 থেকে রিয়েল কমেন্টস লোড করা হচ্ছে...
                        </h4>
                        <p className="text-xs text-slate-400">
                          আপনার চ্যানেলের সর্বশেষ ভিডিও কমেন্টস এবং রেসপন্স ডাটা সিঙ্ক হচ্ছে
                        </p>
                      </div>
                    ) : ytComments.length === 0 ? (
                      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto border border-red-200 dark:border-red-900">
                          <Youtube className="w-7 h-7" />
                        </div>
                        <div className="space-y-1 max-w-md mx-auto">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">
                            কোনো নতুন কমেন্ট পাওয়া যায়নি
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            আপনার কানেক্টেড YouTube চ্যানেল <strong>{ytConfig.channelTitle || 'ChartLogic'}</strong>-এ এই মুহূর্তে কোনো নতুন বা আনরিপ্লাইড কমেন্ট নেই। দর্শক যখনই কোনো ভিডিওতে কমেন্ট করবেন, তা সরাসরি এখানে প্রদর্শিত হবে।
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={handleManualRefreshYt}
                            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                            এখনই সিঙ্ক করুন (Refresh Sync)
                          </button>
                          {ytConfig.channelId && (
                            <a
                              href={`https://www.youtube.com/channel/${ytConfig.channelId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View Channel
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {ytComments
                          .filter((c) => {
                            if (ytCommentFilter === 'live') return c.isLiveStream || c.isCompletedLive || c.isLiveNow;
                            if (ytCommentFilter === 'videos') return !c.isLiveStream && !c.isCompletedLive && !c.isLiveNow;
                            return true;
                          })
                          .map((comment) => {
                          const isLiked = !!likedComments[comment.id];
                          const displayLikes = commentLikeCounts[comment.id] !== undefined ? commentLikeCounts[comment.id] : (comment.likeCount || 0);
                          const isAiLoading = !!isAiGeneratingReply[comment.id];
                          const rawCleanText = cleanCommentText(comment.textOriginal || comment.textDisplay);
                          const finalText = rawCleanText || comment.textOriginal || comment.textDisplay || '❤️';

                          return (
                            <div
                              key={comment.id}
                              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                            >
                              {/* Video Source Metadata Banner */}
                              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/60">
                                <div className="flex items-center gap-2 min-w-0">
                                  {comment.videoThumbnail ? (
                                    <img
                                      src={comment.videoThumbnail}
                                      alt="Video thumbnail"
                                      className="w-10 h-7 rounded-md object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                      {comment.isLiveNow || comment.isCompletedLive || comment.isLiveStream ? (
                                        <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                                      ) : (
                                        <Video className="w-4 h-4" />
                                      )}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <span className="text-[10px] uppercase font-black tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
                                      {comment.isLiveNow ? (
                                        <>
                                          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping mr-0.5 inline-block" />
                                          🔴 লাইভ চলাকালীন কমেন্ট
                                        </>
                                      ) : comment.isCompletedLive || comment.isLiveStream ? (
                                        <>
                                          <Radio className="w-3 h-3 text-red-500" />
                                          📼 সম্পন্ন হওয়া লাইভ স্ট্রিম কমেন্ট
                                        </>
                                      ) : (
                                        <>
                                          <Youtube className="w-3 h-3" />
                                          ভিডিও কমেন্ট
                                        </>
                                      )}
                                    </span>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm md:max-w-md" title={comment.videoTitle}>
                                      {comment.videoTitle || 'YouTube Channel Video'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Pinned Badge if this comment is pinned on YouTube */}
                                  {(comment.isPinned || pinnedCommentsMap[comment.videoId] === comment.id) && (
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-black flex items-center gap-1 shadow-xs">
                                      <Pin className="w-3 h-3 fill-white rotate-45" />
                                      <span>📌 Pinned on Top (পিন করা)</span>
                                    </span>
                                  )}
                                  {comment.videoId && (
                                    <a
                                      href={`https://www.youtube.com/watch?v=${comment.videoId}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors flex items-center gap-1 shrink-0"
                                    >
                                      <span>ভিডিও দেখুন</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Author & Like Button */}
                              <div className="flex items-start justify-between gap-3 pt-1">
                                <div className="flex items-center gap-3">
                                  {comment.authorProfileImageUrl ? (
                                    <img
                                      src={comment.authorProfileImageUrl}
                                      alt={comment.authorDisplayName}
                                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                                      {comment.authorDisplayName?.charAt(0) || 'U'}
                                    </div>
                                  )}
                                  <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                        {comment.authorDisplayName}
                                      </h4>
                                      {/* Follow / Subscribed Button */}
                                      <button
                                        type="button"
                                        onClick={() => handleToggleFollow(comment.authorDisplayName, comment.authorChannelUrl)}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                                          followedAuthors[comment.authorDisplayName]
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                            : 'bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                        }`}
                                        title={followedAuthors[comment.authorDisplayName] ? 'ফলো করা হচ্ছে' : 'ইউজারকে ফলো করুন'}
                                      >
                                        {followedAuthors[comment.authorDisplayName] ? (
                                          <>
                                            <Check className="w-2.5 h-2.5" />
                                            <span>Following</span>
                                          </>
                                        ) : (
                                          <>
                                            <Plus className="w-2.5 h-2.5" />
                                            <span>Follow</span>
                                          </>
                                        )}
                                      </button>
                                      {comment.authorChannelUrl && (
                                        <a
                                          href={comment.authorChannelUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-[10px] text-slate-400 hover:text-red-600 transition-colors"
                                          title="ভিউ অরিজিনাল চ্যানেল"
                                        >
                                          <ExternalLink className="w-2.5 h-2.5" />
                                        </a>
                                      )}
                                      <span className="text-[10px] text-slate-400">
                                        {new Date(comment.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(comment.publishedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Interactive Actions for Top Comment: Pin/Unpin, Edit, Delete, Like */}
                                <div className="flex items-center gap-2">
                                  {/* Pin / Unpin Button */}
                                  {comment.videoId && (
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePinComment(comment.videoId, comment.id, !!comment.isPinned || pinnedCommentsMap[comment.videoId] === comment.id)}
                                      disabled={pinningCommentId === comment.id}
                                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl border transition-all ${
                                        comment.isPinned || pinnedCommentsMap[comment.videoId] === comment.id
                                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs font-bold'
                                          : 'bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-semibold'
                                      }`}
                                      title={comment.isPinned || pinnedCommentsMap[comment.videoId] === comment.id ? "কমেন্টটি আন-পিন করুন" : "কমেন্টটি ভিডিওর শীর্ষে পিন (Pin to Top) করুন"}
                                    >
                                      {pinningCommentId === comment.id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : comment.isPinned || pinnedCommentsMap[comment.videoId] === comment.id ? (
                                        <Pin className="w-3.5 h-3.5 fill-white text-white rotate-45" />
                                      ) : (
                                        <Pin className="w-3.5 h-3.5" />
                                      )}
                                      <span>{comment.isPinned || pinnedCommentsMap[comment.videoId] === comment.id ? 'Pinned 📌' : 'Pin to Top'}</span>
                                    </button>
                                  )}

                                  {isMyReplyOrComment(comment) && editingReplyId !== comment.id && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditTopComment(comment)}
                                        className="px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-1"
                                        title="আপনার কমেন্টটি এডিট করুন"
                                      >
                                        <Pencil className="w-3 h-3" />
                                        <span>এডিট</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTopComment(comment.id)}
                                        className="px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg border border-red-200 dark:border-red-800 transition-colors flex items-center gap-1"
                                        title="কমেন্টটি মুছে ফেলুন"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        <span>ডিলিট</span>
                                      </button>
                                    </div>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleToggleYtLike(comment.id, comment.likeCount)}
                                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all ${
                                      isLiked
                                        ? 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800 shadow-xs font-bold'
                                        : 'bg-slate-50 hover:bg-red-50/50 text-slate-600 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 font-semibold'
                                    }`}
                                    title={isLiked ? "লাইক রিমুভ করুন" : "কমেন্টে লাইক দিন"}
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-slate-400'}`} />
                                    <span>{displayLikes}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Comment Text with Inline Edit Mode or Unicode Emoji Display */}
                              {editingReplyId === comment.id ? (
                                <div className="space-y-2 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-red-300 dark:border-red-800 shadow-inner">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                      <Pencil className="w-3.5 h-3.5 text-red-500" /> আপনার মূল কমেন্টটি এডিট ও সংশোধন করুন:
                                    </span>
                                    {/* Mini Emoji Picker */}
                                    <div className="flex items-center gap-1">
                                      {['❤️', '🔥', '👍', '😊', '🙏', '💯'].map((em) => (
                                        <button
                                          key={em}
                                          type="button"
                                          onClick={() => handleInsertEditEmoji(em)}
                                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs"
                                        >
                                          {em}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <textarea
                                    value={editingReplyText}
                                    onChange={(e) => setEditingReplyText(e.target.value)}
                                    rows={3}
                                    className="w-full p-2.5 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                                    placeholder="কমেন্ট সংশোধন করুন..."
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={handleCancelEditReply}
                                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <X className="w-3 h-3" />
                                      বাতিল
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEditReply(comment.id, comment.id)}
                                      className="px-4 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                                    >
                                      <Check className="w-3 h-3" />
                                      আপডেট করুন
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  id={`yt-comment-text-${comment.id}`}
                                  className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-sm font-normal text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-line tracking-normal select-text shadow-2xs text-base"
                                >
                                  {finalText}
                                  {comment.isEdited && (
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold ml-2">(আপডেটেড)</span>
                                  )}
                                </div>
                              )}

                              {/* Existing Replies and Nested Thread */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="space-y-3 pl-4 border-l-2 border-red-500/40 mt-3">
                                  {comment.replies.map((rep: any) => {
                                    const repClean = cleanCommentText(rep.textOriginal || rep.textDisplay);
                                    const isMine = isMyReplyOrComment(rep);
                                    const isRepLiked = !!likedReplies[rep.id];
                                    const repLikes = replyLikeCounts[rep.id] !== undefined ? replyLikeCounts[rep.id] : (rep.likeCount || 0);
                                    const isEditingThis = editingReplyId === rep.id;

                                    return (
                                      <div
                                        key={rep.id}
                                        className={`p-3.5 rounded-xl text-xs space-y-2.5 transition-all ${
                                          isMine
                                            ? 'bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60'
                                            : 'bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            {isMine ? (
                                              <span className="font-bold text-red-700 dark:text-red-400 text-xs flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/50">
                                                <Youtube className="w-3.5 h-3.5 text-red-600" />
                                                {rep.authorDisplayName || ytConfig.channelTitle || 'ChartLogic (You)'}
                                                <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-300 ml-0.5">• ক্রিয়েটর</span>
                                              </span>
                                            ) : (
                                              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-slate-500" />
                                                {rep.authorDisplayName || 'দর্শক'}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                            {rep.isEdited && (
                                              <span className="text-amber-600 dark:text-amber-400 font-semibold">(আপডেটেড)</span>
                                            )}
                                            <span>
                                              {rep.publishedAt ? new Date(rep.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'এখন'}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Reply Content (Editable if user is owner and in edit mode) */}
                                        {isEditingThis ? (
                                          <div className="space-y-2 bg-white dark:bg-slate-900 p-3 rounded-lg border border-red-300 dark:border-red-800 shadow-inner">
                                            <div className="flex items-center justify-between">
                                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                                <Pencil className="w-3 h-3 text-red-500" /> আপনার উত্তরটি এডিট ও সংশোধন করুন:
                                              </span>
                                              {/* Mini Emoji Picker for Edit */}
                                              <div className="flex items-center gap-1">
                                                {['❤️', '🔥', '👍', '😊', '🙏', '💯'].map((em) => (
                                                  <button
                                                    key={em}
                                                    type="button"
                                                    onClick={() => handleInsertEditEmoji(em)}
                                                    className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs"
                                                  >
                                                    {em}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                            <textarea
                                              value={editingReplyText}
                                              onChange={(e) => setEditingReplyText(e.target.value)}
                                              rows={2}
                                              className="w-full p-2.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                                              placeholder="উত্তর সংশোধন করুন..."
                                            />
                                            <div className="flex items-center justify-end gap-2">
                                              <button
                                                type="button"
                                                onClick={handleCancelEditReply}
                                                className="px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                                              >
                                                <X className="w-3 h-3" />
                                                বাতিল
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => handleSaveEditReply(comment.id, rep.id)}
                                                className="px-3.5 py-1 text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                                              >
                                                <Check className="w-3 h-3" />
                                                আপডেট করুন
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-slate-900 dark:text-slate-100 text-xs leading-relaxed whitespace-pre-line font-medium text-sm">
                                            {repClean || rep.textOriginal || rep.textDisplay}
                                          </p>
                                        )}

                                        {/* Action Bar on Reply (Like, Reply, Edit, Delete) */}
                                        {!isEditingThis && (
                                          <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50 text-[11px]">
                                            <div className="flex items-center gap-3">
                                              {/* Like on Reply */}
                                              <button
                                                type="button"
                                                onClick={() => handleToggleReplyLike(rep.id, rep.likeCount)}
                                                className={`flex items-center gap-1 font-semibold transition-colors ${
                                                  isRepLiked ? 'text-red-600 font-bold' : 'text-slate-500 hover:text-red-600 dark:text-slate-400'
                                                }`}
                                                title={isRepLiked ? "লাইক বাতিল করুন" : "রিপ্লাইয়ে লাইক দিন"}
                                              >
                                                <Heart className={`w-3.5 h-3.5 ${isRepLiked ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                                                <span>{repLikes > 0 ? repLikes : 'লাইক'}</span>
                                              </button>

                                              {/* Reply to this specific author / thread */}
                                              <button
                                                type="button"
                                                onClick={() => handleReplyToAuthor(comment.id, rep.authorDisplayName, rep.id)}
                                                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 font-semibold flex items-center gap-1 transition-colors"
                                              >
                                                <Reply className="w-3.5 h-3.5" />
                                                <span>উত্তর দিন</span>
                                              </button>
                                            </div>

                                            {/* Creator-only Edit & Delete Actions (Others' comments cannot be edited) */}
                                            {isMine && (
                                              <div className="flex items-center gap-1.5">
                                                <button
                                                  type="button"
                                                  onClick={() => handleStartEditReply(rep, comment.id)}
                                                  className="px-2 py-0.5 rounded-md text-amber-700 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-950/50 font-semibold transition-colors flex items-center gap-1"
                                                  title="আপনার কমেন্টটি এডিট ও সংশোধন করুন"
                                                >
                                                  <Pencil className="w-3 h-3" />
                                                  <span>এডিট</span>
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => handleDeleteReply(comment.id, rep.id)}
                                                  className="px-2 py-0.5 rounded-md text-red-600 hover:bg-red-100/60 dark:hover:bg-red-950/50 font-semibold transition-colors flex items-center gap-1"
                                                  title="কমেন্টটি মুছে ফেলুন"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                  <span>ডিলিট</span>
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Quick Emoji Bar & Reply Input Box */}
                              <div className="pt-2 space-y-2">
                                {/* Replying to banner if active */}
                                {replyingToInfo[comment.id] && (
                                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-700 dark:text-red-300">
                                    <span className="flex items-center gap-1.5 font-medium">
                                      <Reply className="w-3.5 h-3.5 text-red-600" />
                                      রিপ্লাই দেওয়া হচ্ছে: <strong>@{replyingToInfo[comment.id]?.authorName}</strong>-কে
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCancelReplyToAuthor(comment.id)}
                                      className="text-[11px] font-bold text-slate-500 hover:text-red-600 flex items-center gap-0.5"
                                    >
                                      <X className="w-3 h-3" />
                                      বাতিল
                                    </button>
                                  </div>
                                )}

                                {/* Quick Emojis Selection Bar */}
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-sm">
                                  <span className="text-[10px] text-slate-400 font-medium mr-1 shrink-0 flex items-center gap-0.5">
                                    <Smile className="w-3 h-3" /> ইমোজি:
                                  </span>
                                  {['❤️', '🔥', '👍', '😍', '🙏', '👏', '🎉', '💯', '😊', '🛍️', '✨', '⚡'].map((em) => (
                                    <button
                                      key={em}
                                      type="button"
                                      onClick={() => handleInsertEmoji(comment.id, em)}
                                      className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm transition-transform active:scale-125"
                                      title={`ইনসার্ট করুন ${em}`}
                                    >
                                      {em}
                                    </button>
                                  ))}
                                </div>

                                <div className="flex items-center gap-2">
                                  <input
                                    id={`yt-reply-input-${comment.id}`}
                                    type="text"
                                    value={ytReplyDrafts[comment.id] || ''}
                                    onChange={(e) => setYtReplyDrafts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendYtReply(comment.id)}
                                    placeholder="ইউটিউব কমেন্টের সরাসরি উত্তর লিখুন (বা @নাম দিয়ে রিপ্লাই দিন)..."
                                    className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-slate-400"
                                  />
                                  <button
                                    type="button"
                                    disabled={isAiLoading}
                                    onClick={() => handleGenerateYtAiReply(comment.id, finalText, comment.authorDisplayName, comment.videoTitle, comment.videoId)}
                                    className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 shrink-0"
                                    title="Gemini AI Auto-Generate Reply with Video Context"
                                  >
                                    {isAiLoading ? (
                                      <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                                    ) : (
                                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                    )}
                                    <span>AI Reply</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSendYtReply(comment.id)}
                                    disabled={!ytReplyDrafts[comment.id]?.trim()}
                                    className="px-4 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-md shadow-red-600/20 shrink-0"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Reply</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. REAL LIVE STREAM CHAT & COMPLETED LIVE STREAMS */}
                {ytActiveSubTab === 'live_chat' && (
                  <div className="space-y-4">
                    {/* Live View Mode Selector Bar */}
                    <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setLiveViewMode('active_live');
                            setSelectedPastStream(null);
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            liveViewMode === 'active_live'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Radio className={`w-3.5 h-3.5 ${ytLiveStatus.isStreamActive ? 'text-white animate-pulse' : ''}`} />
                          <span>লাইভ চলাকালীন চ্যাট</span>
                          {ytLiveStatus.isStreamActive && (
                            <span className="w-2 h-2 rounded-full bg-white animate-ping ml-0.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLiveViewMode('past_livestreams');
                            if (pastLiveStreams.length === 0) fetchPastLiveStreams();
                          }}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            liveViewMode === 'past_livestreams'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>সম্পন্ন হওয়া লাইভ স্ট্রিম ও কমেন্টস</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${liveViewMode === 'past_livestreams' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            {pastLiveStreams.length || ytComments.filter(c => c.isCompletedLive || c.isLiveStream).length}
                          </span>
                        </button>
                      </div>

                      {/* Auto-Sync Controls for Active Live Stream */}
                      {liveViewMode === 'active_live' && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setLiveAutoRefresh(!liveAutoRefresh)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              liveAutoRefresh
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}
                            title={liveAutoRefresh ? 'অটো-সিঙ্ক বন্ধ করুন' : 'অটো-সিঙ্ক চালু করুন'}
                          >
                            <span className={`w-2 h-2 rounded-full ${liveAutoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            <span>{liveAutoRefresh ? `অটো-সিঙ্ক চালু (${liveRefreshInterval}s)` : 'অটো-সিঙ্ক বন্ধ'}</span>
                          </button>

                          {/* Polling Interval Select */}
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                            {[2, 3, 5, 10].map((sec) => (
                              <button
                                key={sec}
                                type="button"
                                onClick={() => setLiveRefreshInterval(sec)}
                                className={`px-2 py-1 rounded-md transition-all ${
                                  liveRefreshInterval === sec
                                    ? 'bg-white dark:bg-slate-900 text-red-600 shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                              >
                                {sec}s
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => fetchYtLiveChat()}
                            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                            title="এখনই লাইভ চ্যাট রিফ্রেশ করুন"
                          >
                            <RotateCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {liveViewMode === 'past_livestreams' && (
                        <button
                          type="button"
                          onClick={() => fetchPastLiveStreams()}
                          disabled={loadingPastStreams}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${loadingPastStreams ? 'animate-spin' : ''}`} />
                          <span>রিফ্রেশ করুন</span>
                        </button>
                      )}
                    </div>

                    {/* MODE 1: ACTIVE LIVE STREAM & REAL-TIME LIVE CHAT */}
                    {liveViewMode === 'active_live' && (
                      <div className="space-y-4">
                        {ytLiveStatus.isStreamActive ? (
                          <div className="space-y-4">
                            {/* Live Active Header Bar */}
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white flex items-center justify-between text-xs shadow-lg shadow-red-600/20 flex-wrap gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                                  <Radio className="w-5 h-5 text-white animate-pulse" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full bg-white text-red-600 font-black text-[10px] tracking-wider animate-pulse uppercase">
                                      🔴 LIVE NOW
                                    </span>
                                    <span className="font-bold text-sm">{ytLiveStatus.liveTitle || 'YouTube Live Broadcast'}</span>
                                  </div>
                                  <p className="text-[11px] text-white/80 mt-0.5">
                                    চ্যানেল: <strong>{ytConfig.channelTitle}</strong> • সর্বশেষ আপডেট: {lastLiveSyncTime.toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="px-3.5 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white font-bold text-xs border border-white/30">
                                  👥 {ytLiveStatus.viewerCount || 'Active'} ভিউয়ার
                                </span>
                                {ytLiveStatus.liveVideoId && (
                                  <a
                                    href={`https://www.youtube.com/watch?v=${ytLiveStatus.liveVideoId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3.5 py-1.5 rounded-xl bg-white text-red-600 font-bold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-xs"
                                  >
                                    <span>লাইভ ব্রডকাস্ট দেখুন</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Chat Messages Container */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-[420px] overflow-y-auto space-y-3 shadow-inner">
                              {ytLiveMessages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3">
                                  <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                                    <Radio className="w-6 h-6 animate-pulse" />
                                  </div>
                                  <p className="text-xs font-medium max-w-sm">
                                    লাইভ স্ট্রিমিং সক্রিয় রয়েছে! দর্শকদের পাঠানো লাইভ চ্যাট মেসেজ প্রতি {liveRefreshInterval} সেকেন্ডে স্বয়ংক্রিয়ভাবে এখানে আসবে।
                                  </p>
                                </div>
                              ) : (
                                ytLiveMessages.map((msg) => (
                                  <div
                                    key={msg.id}
                                    className={`p-3.5 rounded-2xl text-xs space-y-1.5 transition-all group hover:shadow-xs ${
                                      msg.isPinned
                                        ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700'
                                        : msg.isChatOwner
                                        ? 'bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-900'
                                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {msg.authorAvatar ? (
                                          <img
                                            src={msg.authorAvatar}
                                            alt={msg.authorName}
                                            className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                          />
                                        ) : (
                                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                                            {msg.authorName?.charAt(0)}
                                          </div>
                                        )}
                                        <span className={`font-bold ${msg.isChatOwner ? 'text-red-700 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                          {msg.authorName}
                                        </span>
                                        {msg.isChatOwner && (
                                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-red-600 text-white tracking-wider">
                                            HOST
                                          </span>
                                        )}
                                        {msg.isChatModerator && !msg.isChatOwner && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-600 text-white">
                                            MOD
                                          </span>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                                        <button
                                          type="button"
                                          onClick={() => handleMentionLiveViewer(msg.authorName)}
                                          className="opacity-0 group-hover:opacity-100 px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-800 text-red-600 hover:bg-red-50 border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-0.5"
                                          title={`@${msg.authorName}-কে লাইভে রিপ্লাই দিন`}
                                        >
                                          <Reply className="w-2.5 h-2.5" />
                                          <span>রিপ্লাই</span>
                                        </button>
                                      </div>
                                    </div>
                                    <p className="text-slate-800 dark:text-slate-200 pl-9 leading-relaxed font-normal">
                                      {msg.message}
                                    </p>
                                  </div>
                                ))
                              )}
                              <div ref={liveChatBottomRef} />
                            </div>

                            {/* Send Live Host Broadcast / Reply */}
                            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                              {/* Quick Emojis Bar */}
                              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-sm">
                                <span className="text-[10px] text-slate-400 font-medium mr-1 shrink-0 flex items-center gap-0.5">
                                  <Smile className="w-3 h-3" /> লাইভ ইমোজি:
                                </span>
                                {['🔥', '❤️', '👏', '👍', '🎉', '✨', '💯', '🛍️', '😍', '🙏'].map((em) => (
                                  <button
                                    key={em}
                                    type="button"
                                    onClick={() => setYtLiveInput(prev => prev + ' ' + em)}
                                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-sm transition-transform active:scale-125"
                                  >
                                    {em}
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={ytLiveInput}
                                  onChange={(e) => setYtLiveInput(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSendLiveChatMsg()}
                                  placeholder="হোস্ট বা মডারেটর মেসেজ লিখুন (বা কোনো দর্শককে @নাম দিয়ে রিপ্লাই দিন)..."
                                  className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-slate-400"
                                />
                                <button
                                  type="button"
                                  onClick={handleSendLiveChatMsg}
                                  disabled={!ytLiveInput.trim()}
                                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 disabled:opacity-40 transition-all flex items-center gap-1.5 shrink-0"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>Send to Live</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto border border-red-200 dark:border-red-900">
                              <Radio className="w-8 h-8 text-red-500" />
                            </div>
                            <div className="space-y-1.5 max-w-md mx-auto">
                              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                চ্যানেলে এই মুহূর্তে কোনো লাইভ ব্রডকাস্ট চলছে না
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                আপনার YouTube চ্যানেল <strong>{ytConfig.channelTitle || 'ChartLogic'}</strong>-এ লাইভ স্ট্রিমিং চালু হলে দর্শকদের রিয়েল-টাইম চ্যাট স্বয়ংক্রিয়ভাবে এখানে স্ট্রিম হবে। পূর্ববর্তী সম্পন্ন হওয়া লাইভ স্ট্রিমের কমেন্টগুলো দেখতে পাশের ট্যাবে ক্লিক করুন।
                              </p>
                            </div>
                            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
                              <button
                                type="button"
                                onClick={() => fetchYtLiveChat()}
                                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                                চেক লাইভ স্ট্যাটাস (Check Live)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setLiveViewMode('past_livestreams');
                                  fetchPastLiveStreams();
                                }}
                                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1.5"
                              >
                                <Video className="w-3.5 h-3.5 text-red-600" />
                                পূর্ববর্তী লাইভ স্ট্রিম কমেন্টস দেখুন
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* MODE 2: PAST COMPLETED LIVE STREAMS & THEIR VIEWER COMMENTS */}
                    {liveViewMode === 'past_livestreams' && (
                      <div className="space-y-4">
                        {loadingPastStreams ? (
                          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                            <RotateCw className="w-8 h-8 text-red-600 animate-spin mx-auto" />
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              সম্পন্ন হওয়া পূর্ববর্তী লাইভ স্ট্রিম ডাটা লোড হচ্ছে...
                            </h4>
                            <p className="text-xs text-slate-400">
                              আপনার চ্যানেলের পূর্ববর্তী সমস্ত লাইভ ব্রডকাস্ট ও দর্শক কমেন্ট ফেচ করা হচ্ছে
                            </p>
                          </div>
                        ) : selectedPastStream ? (
                          /* Detailed View for Specific Selected Past Live Stream */
                          <div className="space-y-4">
                            {/* Back to Streams list button */}
                            <div className="flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => setSelectedPastStream(null)}
                                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
                              >
                                <span>← সকল সম্পন্ন লাইভ স্ট্রিম তালিকা</span>
                              </button>
                              <span className="text-xs text-slate-500 font-medium">
                                লাইভ স্ট্রিম কমেন্ট ম্যানেজমেন্ট
                              </span>
                            </div>

                            {/* Stream Metadata Card */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-3 min-w-0">
                                {selectedPastStream.thumbnail ? (
                                  <img
                                    src={selectedPastStream.thumbnail}
                                    alt={selectedPastStream.title}
                                    className="w-20 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0">
                                    <Video className="w-6 h-6" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 text-[10px] font-bold">
                                      📼 রেকর্ডেড লাইভ
                                    </span>
                                    <span className="text-[11px] text-slate-400">
                                      {new Date(selectedPastStream.publishedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md mt-0.5">
                                    {selectedPastStream.title}
                                  </h3>
                                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                    <span>👁️ {selectedPastStream.viewCount || 0} ভিউজ</span>
                                    <span>💬 {selectedPastStream.commentCount || 0} কমেন্টস</span>
                                  </div>
                                </div>
                              </div>
                              <a
                                href={`https://www.youtube.com/watch?v=${selectedPastStream.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-red-600/20 shrink-0"
                              >
                                <span>YouTube-এ দেখুন</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            {/* Comments on this stream */}
                            <div className="space-y-4">
                              {ytComments.filter(c => c.videoId === selectedPastStream.id).length === 0 ? (
                                <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                                  <p className="text-xs text-slate-500">এই লাইভ স্ট্রিমে এখনো কোনো কমেন্ট নেই বা কমেন্ট সিঙ্ক হচ্ছে।</p>
                                  <button
                                    type="button"
                                    onClick={handleManualRefreshYt}
                                    className="px-3 py-1.5 text-xs font-bold text-red-600 hover:underline"
                                  >
                                    কমেন্ট রিফ্রেশ করুন
                                  </button>
                                </div>
                              ) : (
                                ytComments
                                  .filter(c => c.videoId === selectedPastStream.id)
                                  .map((comment) => {
                                    const isLiked = !!likedComments[comment.id];
                                    const displayLikes = commentLikeCounts[comment.id] !== undefined ? commentLikeCounts[comment.id] : (comment.likeCount || 0);
                                    const isAiLoading = !!isAiGeneratingReply[comment.id];
                                    const rawCleanText = cleanCommentText(comment.textOriginal || comment.textDisplay);
                                    const finalText = rawCleanText || comment.textOriginal || comment.textDisplay || '❤️';

                                    return (
                                      <div
                                        key={comment.id}
                                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5"
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex items-center gap-3">
                                            {comment.authorProfileImageUrl ? (
                                              <img
                                                src={comment.authorProfileImageUrl}
                                                alt={comment.authorDisplayName}
                                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                              />
                                            ) : (
                                              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                                                {comment.authorDisplayName?.charAt(0) || 'U'}
                                              </div>
                                            )}
                                            <div>
                                              <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                                  {comment.authorDisplayName}
                                                </h4>
                                                <span className="text-[10px] text-slate-400">
                                                  {new Date(comment.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(comment.publishedAt).toLocaleDateString()}
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => handleToggleYtLike(comment.id, comment.likeCount)}
                                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                                isLiked
                                                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                                                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                                              }`}
                                            >
                                              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                                              <span>{displayLikes}</span>
                                            </button>
                                          </div>
                                        </div>

                                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed pl-13">
                                          {finalText}
                                        </p>

                                        {/* Replies list */}
                                        {comment.replies && comment.replies.length > 0 && (
                                          <div className="pl-13 space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                                            {comment.replies.map((rep: any) => (
                                              <div key={rep.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                                                <div className="flex items-center justify-between">
                                                  <span className="font-bold text-slate-900 dark:text-white">{rep.authorDisplayName}</span>
                                                  <span className="text-[10px] text-slate-400">{new Date(rep.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-slate-700 dark:text-slate-300 mt-1">{rep.textDisplay}</p>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Reply Box */}
                                        <div className="pl-13 flex items-center gap-2 pt-2">
                                          <input
                                            type="text"
                                            value={ytReplyDrafts[comment.id] || ''}
                                            onChange={(e) => setYtReplyDrafts(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendYtReply(comment.id)}
                                            placeholder="লাইভ স্ট্রিম কমেন্টের উত্তর লিখুন..."
                                            className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => handleGenerateYtAiReply(comment.id, finalText, comment.authorDisplayName, comment.videoTitle, comment.videoId)}
                                            className="px-3.5 py-2.5 text-xs font-bold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1 shrink-0"
                                          >
                                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                            <span>AI Reply</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleSendYtReply(comment.id)}
                                            disabled={!ytReplyDrafts[comment.id]?.trim()}
                                            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 flex items-center gap-1 shrink-0"
                                          >
                                            <Send className="w-3.5 h-3.5" />
                                            <span>Reply</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })
                              )}
                            </div>
                          </div>
                        ) : (
                          /* List of all Past Completed Live Streams */
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>মোট সম্পন্ন হওয়া লাইভ স্ট্রিম: <strong>{pastLiveStreams.length}</strong> টি</span>
                              <span>যেকোনো লাইভ স্ট্রিমে ক্লিক করে তার দর্শক কমেন্টস ও রিপ্লাই দেখুন</span>
                            </div>

                            {pastLiveStreams.length === 0 ? (
                              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                                  <Video className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                                    কোনো সম্পন্ন হওয়া লাইভ স্ট্রিম পাওয়া যায়নি
                                  </h4>
                                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                    আপনার চ্যানেলে লাইভ স্ট্রিমিং সম্পন্ন হলে তা স্বয়ংক্রিয়ভাবে ভিডিও আর্কাইভ হিসেবে এখানে সংরক্ষিত হবে।
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => fetchPastLiveStreams()}
                                  className="px-4 py-2 text-xs font-bold rounded-xl bg-red-600 text-white shadow-xs"
                                >
                                  আবার খুঁজুন (Re-sync Streams)
                                </button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {pastLiveStreams.map((stream) => (
                                  <div
                                    key={stream.id}
                                    onClick={() => setSelectedPastStream(stream)}
                                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500/60 dark:hover:border-red-500/60 hover:shadow-md transition-all cursor-pointer space-y-3 group"
                                  >
                                    <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800">
                                      {stream.thumbnail ? (
                                        <img
                                          src={stream.thumbnail}
                                          alt={stream.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-red-500">
                                          <Video className="w-10 h-10" />
                                        </div>
                                      )}
                                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                                        <Radio className="w-2.5 h-2.5 text-red-400" />
                                        <span>সম্পন্ন লাইভ</span>
                                      </span>
                                      <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white text-[10px] font-medium">
                                        {new Date(stream.publishedAt).toLocaleDateString()}
                                      </span>
                                    </div>

                                    <div>
                                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                                        {stream.title}
                                      </h4>
                                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                                        <div className="flex items-center gap-3">
                                          <span>👁️ {stream.viewCount || 0} ভিউজ</span>
                                          <span>❤️ {stream.likeCount || 0} লাইক</span>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                                          <MessageSquare className="w-3 h-3" />
                                          <span>{stream.commentCount || 0} কমেন্ট</span>
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. REAL YOUTUBE AUTO REPLY RULES */}
                {ytActiveSubTab === 'auto_rules' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Bot className="w-4.5 h-4.5 text-purple-600" />
                            YouTube Comment & Message Automation Rules
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            আপনার কনফিগার করা রিয়েল অটোমেশন রুলস যা YouTube ভিডিও কমেন্টে স্বয়ংক্রিয়ভাবে কাজ করে
                          </p>
                        </div>
                        <a
                          href="/auto-comment-rules"
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 flex items-center gap-1 transition-colors"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          রুলস ম্যানেজার
                        </a>
                      </div>

                      {ytRules.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                          <Bot className="w-8 h-8 text-slate-400 mx-auto" />
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">কোনো অ্যাক্টিভ অটোমেশন রুল যুক্ত নেই।</p>
                          <a
                            href="/auto-comment-rules"
                            className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:underline"
                          >
                            + নতুন রুল তৈরি করুন
                          </a>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {ytRules.map((rule) => (
                            <div
                              key={rule.id}
                              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                                      {rule.name}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      rule.isActive
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                    }`}>
                                      {rule.isActive ? 'Active' : 'Paused'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 flex-wrap pt-1">
                                    <span className="text-[11px] text-slate-400 font-medium">Trigger Keywords:</span>
                                    {rule.keywords.map((kw, i) => (
                                      <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                                        {kw}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleToggleYtRule(rule)}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                    rule.isActive
                                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-red-50 hover:text-red-700'
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white'
                                  }`}
                                >
                                  {rule.isActive ? 'Active (Click to Pause)' : 'Paused (Click to Activate)'}
                                </button>
                              </div>

                              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                                <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                                  Public Replies ({rule.publicReplies.length} Variations):
                                </p>
                                <p className="italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700 text-[11px]">
                                  "{rule.publicReplies[0]}"
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. CALL TO ACTION (CTA) & PINNED COMMENTS CREATOR & MANAGER */}
                {ytActiveSubTab === 'cta_pin' && (
                  <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="p-5 rounded-3xl bg-linear-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-lg space-y-3">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="space-y-1">
                          <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold inline-flex items-center gap-1.5">
                            <Pin className="w-3.5 h-3.5 rotate-45" /> YouTube CTA & Pin Comment Studio
                          </span>
                          <h3 className="text-lg font-black tracking-tight">
                            ভিডিও ও লাইভ স্ট্রিমে নিজস্ব কল-টু-অ্যাকশন কমেন্ট ও শীর্ষে পিন (Pin to Top 📌)
                          </h3>
                          <p className="text-xs text-white/90 max-w-2xl leading-relaxed">
                            ইউটিউবে যেকোনো আপলোড করা ভিডিও, লাইভ স্ট্রিম বা সম্পন্ন লাইভ সেশনে চ্যানেলের পক্ষ থেকে আকর্ষণীয় কমেন্ট পোস্ট করুন এবং সেটিকে সবার শীর্ষে পিন করে দর্শকদের দৃষ্টি আকর্ষণ ও কনভার্সন বৃদ্ধি করুন।
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => fetchChannelVideos()}
                          className="px-4 py-2 rounded-2xl bg-white text-red-600 hover:bg-slate-100 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
                        >
                          <RotateCw className={`w-3.5 h-3.5 ${loadingChannelVideos ? 'animate-spin' : ''}`} />
                          <span>ভিডিও তালিকা রিফ্রেশ</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left: Video Selector & CTA Builder (7 Cols) */}
                      <div className="lg:col-span-7 space-y-5">
                        
                        {/* 1. Target Video Selection */}
                        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">১</span>
                              <span>টার্গেট ইউটিউব ভিডিও / লাইভ স্ট্রিম নির্বাচন করুন</span>
                            </h4>
                            <span className="text-[11px] text-slate-400">
                              {channelVideos.length} টি ভিডিও লোড হয়েছে
                            </span>
                          </div>

                          {/* Video Selector Dropdown */}
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                                চ্যানেল থেকে ভিডিও বেছে নিন:
                              </label>
                              <select
                                value={selectedCtaVideoId}
                                onChange={(e) => {
                                  const vid = channelVideos.find(v => v.id === e.target.value);
                                  setSelectedCtaVideoId(e.target.value);
                                  if (vid) setSelectedCtaVideoTitle(vid.title);
                                  setCustomCtaVideoInput('');
                                }}
                                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                              >
                                {channelVideos.map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.isLiveStream ? '🔴 [LIVE] ' : ''}{v.title} {pinnedCommentsMap[v.id] ? '📌 (Pinned Active)' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Or Custom Video ID Input */}
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                                অথবা সরাসরি অন্য কোনো ভিডিওর ID / URL দিন:
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={customCtaVideoInput}
                                  onChange={(e) => setCustomCtaVideoInput(e.target.value)}
                                  placeholder="যেমন: dQw4w9WgXcQ অথবা https://youtu.be/..."
                                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                                {customCtaVideoInput && (
                                  <button
                                    type="button"
                                    onClick={() => setCustomCtaVideoInput('')}
                                    className="p-2 text-slate-400 hover:text-slate-600 text-xs"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Quick CTA Templates & Gemini AI Generator */}
                        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">২</span>
                            <span>রেডিমেড CTA টেমপ্লেট ও AI জেনারেটর</span>
                          </h4>

                          {/* Template Pills */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleSelectCtaTemplate('contact')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                ctaGoalType === 'contact'
                                  ? 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950 dark:text-rose-300 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <Phone className="w-3.5 h-3.5 text-rose-500" />
                              <span>📞 অর্ডার ও হেল্পলাইন</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectCtaTemplate('discount')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                ctaGoalType === 'discount'
                                  ? 'bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-950 dark:text-amber-300 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <Tag className="w-3.5 h-3.5 text-amber-500" />
                              <span>🔥 স্পেশাল ডিসকাউন্ট অফার</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectCtaTemplate('live')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                ctaGoalType === 'live'
                                  ? 'bg-red-50 border-red-400 text-red-700 dark:bg-red-950 dark:text-red-300 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <Radio className="w-3.5 h-3.5 text-red-500" />
                              <span>🔴 লাইভ প্রশ্নোত্তর ও সাপোর্ট</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectCtaTemplate('website')}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                ctaGoalType === 'website'
                                  ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950 dark:text-blue-300 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <Globe className="w-3.5 h-3.5 text-blue-500" />
                              <span>🌐 অফিশিয়াল ওয়েবসাইট লিংক</span>
                            </button>
                          </div>

                          {/* AI Generator Controls */}
                          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 text-purple-600" /> Gemini AI দিয়ে আকর্ষণীয় CTA কমেন্ট তৈরি করুন:
                              </span>
                              <button
                                type="button"
                                onClick={handleGenerateAiCta}
                                disabled={isGeneratingCtaAi}
                                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isGeneratingCtaAi ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                <span>{isGeneratingCtaAi ? 'AI লিখছে...' : 'AI দিয়ে তৈরি করুন'}</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] font-semibold text-purple-800 dark:text-purple-300 mb-1">হটলাইন / WhatsApp:</label>
                                <input
                                  type="text"
                                  value={ctaPhone}
                                  onChange={(e) => setCtaPhone(e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-800 dark:text-white"
                                  placeholder="01700-000000"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-purple-800 dark:text-purple-300 mb-1">ওয়েবসাইট লিংক:</label>
                                <input
                                  type="text"
                                  value={ctaWebsiteUrl}
                                  onChange={(e) => setCtaWebsiteUrl(e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-800 dark:text-white"
                                  placeholder="https://chartlogic.app"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-purple-800 dark:text-purple-300 mb-1">কুপন / ডিসকাউন্ট কোড:</label>
                                <input
                                  type="text"
                                  value={ctaDiscountCode}
                                  onChange={(e) => setCtaDiscountCode(e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-slate-800 dark:text-white"
                                  placeholder="SPECIAL10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 3. Comment Text Composer */}
                        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">৩</span>
                              <span>কমেন্টের বক্তব্য লিখুন ও সাজান</span>
                            </h4>
                            {/* Emoji Bar */}
                            <div className="flex items-center gap-1">
                              {['📌', '👇', '📞', '🌐', '🔥', '🎁', '🛒', '❤️'].map((em) => (
                                <button
                                  key={em}
                                  type="button"
                                  onClick={() => setCtaCommentText(prev => prev + ' ' + em)}
                                  className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs"
                                >
                                  {em}
                                </button>
                              ))}
                            </div>
                          </div>

                          <textarea
                            value={ctaCommentText}
                            onChange={(e) => setCtaCommentText(e.target.value)}
                            rows={5}
                            placeholder="আপনার YouTube ভিডিও বা লাইভ স্ট্রিমের টপ-লেভেল কমেন্ট লিখুন (যেমন: যোগাযোগ নাম্বার, অফার লিংক বা প্রশ্নোত্তর গাইডলাইন)..."
                            className="w-full p-3.5 text-xs sm:text-sm rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none leading-relaxed"
                          />

                          {/* Pin to Top Checkbox & Submit Button */}
                          <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
                            <label className="flex items-center gap-2.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={ctaPinToTop}
                                onChange={(e) => setCtaPinToTop(e.target.checked)}
                                className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                              />
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                <Pin className="w-3.5 h-3.5 text-amber-500 rotate-45" /> ভিডিওর সবার শীর্ষে পিন (Pin to Top 📌) করে রাখুন
                              </span>
                            </label>

                            <button
                              type="button"
                              onClick={handlePostCtaComment}
                              disabled={isSubmittingCta || !ctaCommentText.trim()}
                              className="px-6 py-2.5 rounded-2xl bg-linear-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                              {isSubmittingCta ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Pin className="w-4 h-4 fill-white text-white rotate-45" />
                              )}
                              <span>{isSubmittingCta ? 'পোস্ট ও পিন হচ্ছে...' : 'YouTube-এ পোস্ট ও পিন করুন 📌'}</span>
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* Right: Live Mockup Preview & Pinned Comments Manager (5 Cols) */}
                      <div className="lg:col-span-5 space-y-5">
                        
                        {/* Live YouTube Comment Mockup Card */}
                        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                              <Youtube className="w-4 h-4 text-red-600" /> YouTube Live Preview (দর্শকরা যেমন দেখবে)
                            </span>
                            {ctaPinToTop && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center gap-1">
                                <Pin className="w-2.5 h-2.5 fill-white rotate-45" /> Pinned
                              </span>
                            )}
                          </div>

                          {/* Mock Comment Card */}
                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                            {ctaPinToTop && (
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                <Pin className="w-3.5 h-3.5 text-amber-500 rotate-45 fill-amber-500" />
                                <span>Pinned by {ytConfig.channelTitle || 'ChartLogic'}</span>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                                {ytConfig.channelTitle?.charAt(0) || 'C'}
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs flex items-center gap-1">
                                    @{ytConfig.channelHandle?.replace(/^@/, '') || 'chartlogic'}
                                    <Check className="w-2.5 h-2.5 bg-slate-600 text-white rounded-full p-0.2" />
                                  </span>
                                  <span className="text-[10px] text-slate-400">Just now</span>
                                </div>

                                <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                  {ctaCommentText.trim() || 'এখানে আপনার CTA ও পিন কমেন্টের প্রিভিউ প্রদর্শিত হবে...'}
                                </div>

                                <div className="flex items-center gap-4 pt-2 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <ThumbsUp className="w-3.5 h-3.5" /> 0
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                                  </span>
                                  <span className="font-semibold text-slate-600 dark:text-slate-400">Reply</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Currently Pinned Comments on Channel Videos */}
                        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                              <Pin className="w-3.5 h-3.5 text-amber-500 rotate-45" />
                              <span>অ্যাক্টিভ পিন করা কমেন্টস ({Object.keys(pinnedCommentsMap).length})</span>
                            </h4>
                            <span className="text-[10px] text-slate-400">রিয়েল-টাইম স্ট্যাটাস</span>
                          </div>

                          {Object.keys(pinnedCommentsMap).length === 0 ? (
                            <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-2">
                              <Pin className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto" />
                              <p className="text-xs text-slate-500 font-medium">বর্তমানে কোনো ভিডিওতে পিন কমেন্ট নেই।</p>
                              <p className="text-[11px] text-slate-400">উপরে বামপাশের ফর্ম থেকে যেকোনো ভিডিওতে কমেন্ট পোস্ট করে পিন করুন।</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {Object.entries(pinnedCommentsMap).map(([vidId, cId]) => {
                                const targetVid = channelVideos.find(v => v.id === vidId);
                                return (
                                  <div key={vidId} className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0">
                                        <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                          <Pin className="w-3 h-3 fill-amber-500 text-amber-500 rotate-45" /> Pinned on Video
                                        </span>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                          {targetVid?.title || `Video ID: ${vidId}`}
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleTogglePinComment(vidId, String(cId), true)}
                                        className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 dark:hover:bg-red-950 rounded-lg border border-red-200 dark:border-red-800 transition-colors shrink-0"
                                      >
                                        আন-পিন করুন
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* MODAL: YOUTUBE OAUTH LIVE ACCESS TOKEN SETUP */}
        {showYtOAuthModal && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>YouTube OAuth 2.0 Access Token</span>
                      {ytConfig.accessToken ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold">
                          Required for Write
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      ইউটিউবে সরাসরি লাইভ রিপ্লাই ও লাইক পোস্ট করতে OAuth টোকেন কানেক্ট করুন
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowYtOAuthModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Input */}
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    কেন OAuth Access Token প্রয়োজন?
                  </p>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    YouTube Data API v3 এর নিরাপত্তা পলিসি অনুযায়ী, সাধারণ API Key শুধু কমেন্ট <em>পড়ার (Read-only)</em> অনুমতি দেয়। কিন্তু ভিডিও কমেন্টের <strong>সরাসরি রিপ্লাই, লাইক, এডিট ও ডিলিট</strong> করতে চ্যানেল মালিকের <code>youtube.force-ssl</code> স্কোপযুক্ত OAuth Access Token প্রয়োজন।
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Google OAuth 2.0 Access Token (Bearer Token):</span>
                    {ytConfig.accessToken && (
                      <span className="text-[10px] text-emerald-600 font-bold">✓ বর্তমান টোকেন সংরক্ষিত</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={oauthTokenInput}
                    onChange={(e) => setOauthTokenInput(e.target.value)}
                    placeholder="ya29.a0AfH6SM..."
                    className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                {/* Verification result badge */}
                {oauthVerificationResult && (
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    oauthVerificationResult.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800'
                  }`}>
                    {oauthVerificationResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{oauthVerificationResult.message}</p>
                      {oauthVerificationResult.channelTitle && (
                        <p className="text-[11px] mt-0.5 opacity-90">
                          ভেরিফাইড চ্যানেল: <strong>{oauthVerificationResult.channelTitle}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick 3-Step Guide */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>টোকেন পাওয়ার সহজ উপায়:</span>
                    <a
                      href="https://developers.google.com/oauthplayground"
                      target="_blank"
                      rel="noreferrer"
                      className="text-red-600 hover:underline flex items-center gap-0.5 text-[11px]"
                    >
                      OAuth Playground <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                    <li>Google OAuth Playground-এ গিয়ে <strong>YouTube Data API v3</strong> সিলেক্ট করুন।</li>
                    <li><code>https://www.googleapis.com/auth/youtube.force-ssl</code> স্কোপটি সিলেক্ট করে Authorize করুন।</li>
                    <li>Step 2-এ Exchange Authorization code-এ ক্লিক করে প্রাপ্ত <strong>Access token</strong> এখানে পেস্ট করুন।</li>
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowYtOAuthModal(false)}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  বাতিল করুন
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyAndSaveOAuthToken()}
                  disabled={testingOAuthToken || !oauthTokenInput.trim()}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {testingOAuthToken ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>যাচাই করা হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>ভেরিফাই ও সেভ করুন (Save & Activate)</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* MODAL: QUICK CTA COMMENT CREATOR & PIN POPUP */}
        {showCtaCreatorModal && (
          <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-150">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-red-600 to-amber-600 text-white flex items-center justify-center shadow-md shadow-red-600/20">
                    <Pin className="w-5 h-5 rotate-45" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>YouTube নিজস্ব কমেন্ট পোস্ট ও পিন (Pin to Top 📌)</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 font-bold">
                        Creator Tool
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      ভিডিও বা লাইভ স্ট্রিমে নিজের কমেন্ট লিখে সবার উপরে পিন করে রাখুন
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCtaCreatorModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-4">
                {/* 1. Select Video */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    টার্গেট ভিডিও / লাইভ স্ট্রিম নির্বাচন করুন:
                  </label>
                  <select
                    value={selectedCtaVideoId}
                    onChange={(e) => {
                      const vid = channelVideos.find(v => v.id === e.target.value);
                      setSelectedCtaVideoId(e.target.value);
                      if (vid) setSelectedCtaVideoTitle(vid.title);
                      setCustomCtaVideoInput('');
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold"
                  >
                    {channelVideos.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.isLiveStream ? '🔴 [LIVE] ' : ''}{v.title} {pinnedCommentsMap[v.id] ? '📌 (Pinned Active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Fast Templates & AI Prompt */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    রেডিমেড টেমপ্লেট অথবা Gemini AI জেনারেটর:
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleSelectCtaTemplate('contact')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300"
                    >
                      📞 হেল্পলাইন
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectCtaTemplate('discount')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                    >
                      🔥 ডিসকাউন্ট
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectCtaTemplate('live')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300"
                    >
                      🔴 লাইভ Q&A
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectCtaTemplate('website')}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300"
                    >
                      🌐 ওয়েবসাইট
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateAiCta}
                      disabled={isGeneratingCtaAi}
                      className="ml-auto px-3 py-1 text-[11px] font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 transition-all disabled:opacity-50"
                    >
                      {isGeneratingCtaAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      <span>✨ Gemini AI দিয়ে লিখুন</span>
                    </button>
                  </div>
                </div>

                {/* 3. Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      কমেন্টের বক্তব্য:
                    </label>
                    <div className="flex items-center gap-1">
                      {['📌', '👇', '📞', '🌐', '🔥', '🎁', '🛒'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setCtaCommentText(prev => prev + ' ' + em)}
                          className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-xs"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={ctaCommentText}
                    onChange={(e) => setCtaCommentText(e.target.value)}
                    rows={4}
                    placeholder="আপনার আকর্ষণীয় CTA কমেন্ট লিখুন..."
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                {/* Pin Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                  <input
                    type="checkbox"
                    checked={ctaPinToTop}
                    onChange={(e) => setCtaPinToTop(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5 text-amber-600 rotate-45 fill-amber-600" />
                    পোস্ট করার পর স্বয়ংক্রিয়ভাবে ভিডিওর শীর্ষে পিন (Pin to Top 📌) করুন
                  </span>
                </label>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCtaCreatorModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  বাতিল করুন
                </button>
                <button
                  type="button"
                  onClick={handlePostCtaComment}
                  disabled={isSubmittingCta || !ctaCommentText.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-linear-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingCta ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>পোস্ট ও পিন হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Pin className="w-3.5 h-3.5 fill-white text-white rotate-45" />
                      <span>পোস্ট ও পিন করুন 📌</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Start New Chat / Direct WhatsApp Message Modal */}
        {showNewChatModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                    <MessageSquare className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      সরাসরি নতুন নম্বরে WhatsApp মেসেজ পাঠান
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      যেকোনো ব্যক্তিগত ফোন নম্বর বা গ্রুপে সরাসরি লাইভ বার্তা পাঠান।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    মোবাইল নম্বর বা WhatsApp JID:
                  </label>
                  <input
                    type="text"
                    value={newChatPhone}
                    onChange={(e) => setNewChatPhone(e.target.value)}
                    placeholder="e.g. 01712345678 বা +8801812345678"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    টিপস: যেকোনো ১১ ডিজিটের লোকাল নম্বর লিখলেই সিস্টেম স্বয়ংক্রিয়ভাবে আন্তর্জাতিক ফরম্যাটে রূপান্তর করবে।
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    মেসেজের বক্তব্য:
                  </label>
                  <textarea
                    value={newChatMessage}
                    onChange={(e) => setNewChatMessage(e.target.value)}
                    rows={3}
                    placeholder="আপনার বার্তাটি লিখুন..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  বাতিল
                </button>
                <button
                  type="button"
                  onClick={handleStartNewChat}
                  disabled={isStartingNewChat || !newChatPhone.trim() || !newChatMessage.trim()}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isStartingNewChat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isStartingNewChat ? 'পাঠানো হচ্ছে...' : 'সরাসরি পাঠান 🚀'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Custom Knowledge, Multi-Platform Controls & Exclusion Blacklist Modal */}
        {showAiConfigModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>অমনিচ্যানেল এআই বট ও রিপ্লাই কনফিগারেশন</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${masterAiReplyEnabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
                        {masterAiReplyEnabled ? 'মাস্টার সক্রিয়' : 'মাস্টার অফ'}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      কোন কোন সোশ্যাল চ্যানেলে এআই রিপ্লাই দেবে, কোন ব্যক্তিকে বাদ রাখবেন এবং মডেলের আচরণ নির্ধারণ করুন।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiConfigModal(false)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 3 Nav Tabs */}
              <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 shrink-0 overflow-x-auto text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAiConfigTab('platforms')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    aiConfigTab === 'platforms'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>১. সোশ্যাল চ্যানেল সক্রিয়করণ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAiConfigTab('exclusions')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    aiConfigTab === 'exclusions'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>২. ব্যতিক্রম কন্টাক্ট ও ব্ল্যাকলিস্ট</span>
                  {excludedContacts.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-white text-[10px]">
                      {excludedContacts.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setAiConfigTab('model_rules')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    aiConfigTab === 'model_rules'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>৩. মডেল ও বিহেভিয়ার রুলস</span>
                </button>
              </div>

              {/* Tab Content Body */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
                
                {/* TAB 1: PLATFORMS ON/OFF */}
                {aiConfigTab === 'platforms' && (
                  <div className="space-y-4">
                    {/* Master Switch Banner */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                      masterAiReplyEnabled
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-100'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-950 dark:text-rose-100'
                    }`}>
                      <div className="space-y-0.5">
                        <div className="font-black text-sm flex items-center gap-1.5">
                          <span>{masterAiReplyEnabled ? '🟢' : '🔴'}</span>
                          <span>মাস্টার এআই রিপ্লাই কন্ট্রোল (Master AI Reply Switch)</span>
                        </div>
                        <p className="text-[11px] opacity-80">
                          {masterAiReplyEnabled
                            ? 'সিস্টেম সক্রিয় রয়েছে: নির্ধারিত সোশ্যাল চ্যানেলগুলোতে এআই স্বয়ংক্রিয়ভাবে মেসেজের উত্তর দেবে।'
                            : 'সিস্টেম বন্ধ: কোনো সোশ্যাল চ্যানেলেই এআই কোনো মেসেজের উত্তর দেবে না (ম্যানুয়াল সাপোর্ট সক্রিয়)।'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setMasterAiReplyEnabled(!masterAiReplyEnabled)}
                        className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all shrink-0 ${
                          masterAiReplyEnabled
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        {masterAiReplyEnabled ? 'চালু আছে (ON)' : 'বন্ধ আছে (OFF)'}
                      </button>
                    </div>

                    {/* AI Reply Mode Selector */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                          এআই রেসপন্স এক্সিকিউশন মোড (AI Reply Mode):
                        </label>
                        <span className="text-[10px] font-mono font-bold text-purple-600">
                          {aiReplyMode === 'auto_send' ? '⚡ লাইভ অটো-সেন্ড' : '✏️ ড্রাফট রিভিউ'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        এআই কি সরাসরি কাস্টমারকে উত্তর পাঠিয়ে দেবে, নাকি আপনার পর্যালোচনার জন্য ইনপুট বক্সে ড্রাফট হিসেবে রাখবে?
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setAiReplyMode('auto_send')}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                            aiReplyMode === 'auto_send'
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 text-purple-950 dark:text-purple-100 ring-2 ring-purple-400/20'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Zap className={`w-4 h-4 shrink-0 mt-0.5 ${aiReplyMode === 'auto_send' ? 'text-purple-600' : 'text-slate-400'}`} />
                          <div>
                            <div className="font-bold text-xs">⚡ স্বয়ংক্রিয় অটো-সেন্ড (Auto-Send)</div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                              মেসেজ আসলে বা রিপ্লাই বাটন চাপলে এআই তাৎক্ষণিক কাস্টমারকে সরাসরি উত্তর পাঠিয়ে দেয়।
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAiReplyMode('draft_review')}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                            aiReplyMode === 'draft_review'
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-400/20'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <Pencil className={`w-4 h-4 shrink-0 mt-0.5 ${aiReplyMode === 'draft_review' ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <div>
                            <div className="font-bold text-xs">✏️ ড্রাফট ও হিউম্যান রিভিউ (Draft Review)</div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                              এআই উত্তর লিখে ইনপুট বক্সে রাখবে; আপনি পড়ে এডিট করে "পাঠান" চাপলে তবেই যাবে।
                            </p>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Per-Platform Grid */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-800 dark:text-slate-200">
                          সোশ্যাল চ্যানেল ভিত্তিক পৃথক অন/অফ সুইচ (Per-Channel AI Switches):
                        </label>
                        <span className="text-[10px] font-bold text-slate-500">
                          {Object.values(aiEnabledPlatforms).filter(Boolean).length} টি চ্যানেল সক্রিয়
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        যেসব চ্যানেলে এআই উত্তর দেবে সেগুলো সিলেক্ট করে "সক্রিয়" রাখুন। যেমন: পার্সোনাল হোয়াটসঅ্যাপে অফ এবং ফেসবুক পেজে অন রাখতে পারেন।
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {[
                          { id: 'whatsapp' as SocialPlatformId, name: 'WhatsApp', icon: <MessageCircle className="w-4 h-4 text-emerald-600" />, desc: 'কাস্টমার চ্যাট ও পার্সোনাল/গ্রুপ বার্তা' },
                          { id: 'telegram' as SocialPlatformId, name: 'Telegram', icon: <Send className="w-4 h-4 text-sky-500" />, desc: 'টেলিগ্রাম গ্রুপ ও ডিরেক্ট বার্তা' },
                          { id: 'facebook' as SocialPlatformId, name: 'Facebook Messenger', icon: <Facebook className="w-4 h-4 text-blue-600" />, desc: 'ফেসবুক পেজ ইনবক্স কাস্টমার সাপোর্ট' },
                          { id: 'instagram' as SocialPlatformId, name: 'Instagram Direct', icon: <Instagram className="w-4 h-4 text-pink-600" />, desc: 'ইনস্টাগ্রাম ডিএম ও স্টোরি রিপ্লাই' },
                          { id: 'tiktok' as SocialPlatformId, name: 'TikTok', icon: <Music2 className="w-4 h-4 text-slate-900 dark:text-white" />, desc: 'টিকটক মেসেজ ও প্রশ্নোত্তর' },
                          { id: 'youtube' as SocialPlatformId, name: 'YouTube Comments', icon: <Youtube className="w-4 h-4 text-red-600" />, desc: 'ইউটিউব ভিডিও ও লাইভ কমেন্টস রিপ্লাই' },
                        ].map(ch => {
                          const isEnabled = aiEnabledPlatforms[ch.id];
                          return (
                            <div
                              key={ch.id}
                              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                isEnabled
                                  ? 'bg-white dark:bg-slate-800/90 border-purple-200 dark:border-purple-800/80 shadow-xs'
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                                  {ch.icon}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <span>{ch.name}</span>
                                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isEnabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                      {isEnabled ? 'অন' : 'অফ'}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 truncate">{ch.desc}</p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setAiEnabledPlatforms(prev => ({ ...prev, [ch.id]: !prev[ch.id] }))}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                  isEnabled
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-2xs'
                                    : 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {isEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: EXCLUSION BLACKLIST */}
                {aiConfigTab === 'exclusions' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 space-y-1">
                      <div className="font-bold text-xs flex items-center gap-1.5">
                        <UserX className="w-4 h-4 text-amber-600" />
                        <span>নির্দিষ্ট ব্যক্তি, পরিবার বা গ্রুপে এআই রিপ্লাই সম্পূর্ণ বন্ধ রাখুন</span>
                      </div>
                      <p className="text-[11px] opacity-90 leading-relaxed">
                        আপনার পার্সোনাল হোয়াটসঅ্যাপ কন্টাক্ট, কোনো বিশেষ ভিআইপি কাস্টমার বা ফেসবুক ফ্রেন্ডকে এখানে যুক্ত করুন। এই তালিকায় থাকা কোনো কন্টাক্ট মেসেজ পাঠালে এআই কখনোই কোনো উত্তর দেবে না।
                      </p>
                    </div>

                    {/* Quick Action: Currently Opened Conversation Card */}
                    {selectedConv && (
                      <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                            বর্তমানে চ্যাট করা ব্যক্তি / কন্টাক্ট:
                          </div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5 truncate">
                            <span>{selectedConv.customerName}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              ({selectedConv.customerPhone || selectedConv.customerHandle || selectedConv.id})
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            স্ট্যাটাস: {isConvAiExcluded(selectedConv) ? (
                              <span className="text-rose-600 font-bold">🚫 এআই রিপ্লাই বন্ধ আছে (ব্যতিক্রম তালিকাভুক্ত)</span>
                            ) : (
                              <span className="text-emerald-600 font-bold">🟢 এআই অনুমোদিত</span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleToggleExcludeCurrentConv}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shrink-0 flex items-center gap-1.5 shadow-2xs transition-all ${
                            isConvAiExcluded(selectedConv)
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-rose-600 hover:bg-rose-700 text-white'
                          }`}
                        >
                          {isConvAiExcluded(selectedConv) ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>এআই চালু করুন</span>
                            </>
                          ) : (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>🚫 এই ব্যক্তিকে এআই বন্ধ করুন</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Add Excluded Contact Form */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">
                        + নতুন ব্যক্তি বা গ্রুপ এআই ব্যতিক্রম তালিকায় যোগ করুন:
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="md:col-span-1">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">প্ল্যাটফর্ম:</label>
                          <select
                            value={newExcludedPlatform}
                            onChange={(e) => setNewExcludedPlatform(e.target.value as any)}
                            className="w-full px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold"
                          >
                            <option value="all">🌐 সকল প্ল্যাটফর্ম (Universal)</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="telegram">Telegram</option>
                            <option value="facebook">Facebook</option>
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            মোবাইল নম্বর / ইউজারনেম / গ্রুপ JID:
                          </label>
                          <input
                            type="text"
                            value={newExcludedInput}
                            onChange={(e) => setNewExcludedInput(e.target.value)}
                            placeholder="যেমন: 01712345678 বা @username বা 120363xxx@g.us"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">নাম বা বিবরণ (ঐচ্ছিক):</label>
                          <input
                            type="text"
                            value={newExcludedName}
                            onChange={(e) => setNewExcludedName(e.target.value)}
                            placeholder="যেমন: পার্সোনাল ফ্যামিলি নম্বর / VIP বায়ার"
                            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">কারণ বা নোট (ঐচ্ছিক):</label>
                          <input
                            type="text"
                            value={newExcludedReason}
                            onChange={(e) => setNewExcludedReason(e.target.value)}
                            placeholder="যেমন: স্বয়ং আমি কথা বলব"
                            className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={handleAddManualExclusion}
                          disabled={!newExcludedInput.trim()}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ব্যতিক্রম তালিকায় যোগ করুন</span>
                        </button>
                      </div>
                    </div>

                    {/* Excluded List Display */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 dark:text-slate-200">
                          বর্তমান ব্যতিক্রম তালিকা ({excludedContacts.length} জন):
                        </label>
                      </div>

                      {excludedContacts.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                          <p>বর্তমানে কোনো কন্টাক্ট বাদ দেওয়া নেই।</p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            উপরের ফর্মটি ব্যবহার করে অথবা চ্যাটের কন্টাক্ট কার্ড থেকে সরাসরি ব্যক্তি বাদ দিতে পারবেন।
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {excludedContacts.map((ex) => (
                            <div
                              key={ex.id}
                              className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 shrink-0">
                                  <UserX className="w-4 h-4" />
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                    <span>{ex.name}</span>
                                    <span className="text-[10px] font-mono text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.2 rounded font-bold">
                                      {ex.identifier}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                    <span className="uppercase font-bold text-purple-600">{ex.platform}</span>
                                    {ex.reason && <span>• {ex.reason}</span>}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveExclusion(ex.id)}
                                className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-200 transition-all shrink-0 flex items-center gap-1"
                                title="ব্যতিক্রম তালিকা থেকে সরান (এআই চালু হবে)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>সরান</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: MODEL & RULES */}
                {aiConfigTab === 'model_rules' && (
                  <div className="space-y-4">
                    {/* Bot Model Selection */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1.5">
                          <Bot className="w-4 h-4 text-purple-600" />
                          <span>এআই চ্যাটবট মডেল নির্বাচন (AI Bot Model):</span>
                        </label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          🟢 AI Hub এর সাথে সিঙ্কড
                        </span>
                      </div>
                      <select
                        value={activeAiBotModel}
                        onChange={(e) => setActiveAiBotModel(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="gemini:gemini-2.5-flash">🟢 Google Gemini 2.5 Flash (১০০% ফ্রি টিয়ার - দ্রুত ও সাশ্রয়ী)</option>
                        <option value="openai:gpt-4o-mini">⚡ OpenAI GPT-4o-mini (আল্ট্রা-লো-কস্ট ~$0.15/1M - সেরা চ্যাটবট)</option>
                        <option value="openai:gpt-4o">🔥 OpenAI GPT-4o (হাই-এন্ড ফ্ল্যাগশিপ ইন্টেলিজেন্স)</option>
                        <option value="claude:claude-3-5-haiku">⚡ Anthropic Claude 3.5 Haiku (ইনস্ট্যান্ট রেসপন্স)</option>
                        <option value="deepseek:deepseek-chat">💰 DeepSeek Chat V3 (বাজেট ফ্রেন্ডলি)</option>
                      </select>
                      <p className="text-[10px] text-slate-400">
                        💡 চ্যাটবটের জন্য <b>Gemini Flash</b> (ফ্রি) অথবা <b>GPT-4o-mini</b> সবচেয়ে বেশি লাভজনক ও বুদ্ধিমান।
                      </p>
                    </div>

                    {/* Dedicated API Key Input & Connection Verification */}
                    <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-indigo-950 dark:text-indigo-200 text-xs flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-indigo-600" />
                          <span>এআই প্রোভাইডার এপিআই কি ও ভেরিফিকেশন (API Key Configuration):</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleTestApiKeyConnection}
                          disabled={isTestingKey}
                          className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1 transition-all"
                        >
                          {isTestingKey ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                          <span>{isTestingKey ? 'পরীক্ষা চলছে...' : 'সংযোগ টেস্ট করুন'}</span>
                        </button>
                      </div>

                      {keyTestStatus && (
                        <div className={`p-2.5 rounded-xl text-xs font-semibold ${keyTestStatus.startsWith('🟢') ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'}`}>
                          {keyTestStatus}
                        </div>
                      )}

                      {/* Dynamic Provider Input based on active model */}
                      {activeAiBotModel.startsWith('openai') ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">OpenAI API Key:</span>
                            <span className="text-[10px] text-purple-600 font-bold">sk-...</span>
                          </div>
                          <input
                            type="password"
                            value={openAiKeyInput}
                            onChange={(e) => setOpenAiKeyInput(e.target.value)}
                            placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            OpenAI API কি দিলে সরাসরি GPT-4o-mini মডেলের মাধ্যমে কাস্টমার চ্যাটের উত্তর যাবে।
                          </p>
                        </div>
                      ) : activeAiBotModel.startsWith('deepseek') ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">DeepSeek API Key:</span>
                            <span className="text-[10px] text-purple-600 font-bold">sk-...</span>
                          </div>
                          <input
                            type="password"
                            value={deepseekKeyInput}
                            onChange={(e) => setDeepseekKeyInput(e.target.value)}
                            placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                          />
                        </div>
                      ) : activeAiBotModel.startsWith('claude') ? (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Anthropic Claude API Key:</span>
                            <span className="text-[10px] text-purple-600 font-bold">sk-ant-...</span>
                          </div>
                          <input
                            type="password"
                            value={claudeKeyInput}
                            onChange={(e) => setClaudeKeyInput(e.target.value)}
                            placeholder="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Google Gemini API Key:</span>
                            <span className="text-[10px] text-emerald-600 font-bold">১০০% ফ্রি টিয়ার</span>
                          </div>
                          <input
                            type="password"
                            value={geminiKeyInput}
                            onChange={(e) => setGeminiKeyInput(e.target.value)}
                            placeholder="AIzaSy... (খালি রাখলে সিস্টেমের বিল্ট-ইন কি ব্যবহৃত হবে)"
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* AI Tone / Personality */}
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                        বটের কথাবলার ধরন (Bot Tone / Persona):
                      </label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value as any)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                      >
                        <option value="friendly">😊 সৌহার্দ্যপূর্ণ ও অমায়িক (Friendly & Polite - Recommended)</option>
                        <option value="professional">👔 প্রফেশনাল ও ফর্মাল (Professional)</option>
                        <option value="sales">🔥 সেলস ও অফার ফোকাসড (Sales & Deal Closing)</option>
                        <option value="concise">⚡ অতি সংক্ষিপ্ত ও টু-দ্য-পয়েন্ট (Concise & Fast)</option>
                      </select>
                    </div>

                    {/* Store Knowledge */}
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                        🏪 শপ নলেজ ও ডেলিভারি পলিসি (Store Context & Rules):
                      </label>
                      <textarea
                        value={customStoreContext}
                        onChange={(e) => setCustomStoreContext(e.target.value)}
                        rows={3}
                        placeholder="যেমন: ঢাকা সিটির ভিতর ৬০ টাকা, বাইরে ১২০ টাকা। ক্যাশ অন ডেলিভারি দেওয়া যাবে..."
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none font-sans"
                      />
                    </div>

                    {/* Custom Instructions */}
                    <div>
                      <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                        🧠 বিশেষ নির্দেশনাবলী ও হ্যান্ডওভার শর্ত (Custom Bot Prompt):
                      </label>
                      <textarea
                        value={customAiPrompt}
                        onChange={(e) => setCustomAiPrompt(e.target.value)}
                        rows={3}
                        placeholder="যেমন: কাস্টমারকে সালাম দিয়ে বাংলায় উত্তর দাও। কোনো অভিযোগ থাকলে মানব প্রতিনিধির কাছে হ্যান্ডওভার করো..."
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none font-sans"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <div className="text-[11px] text-slate-500">
                  {aiConfigTab === 'exclusions' && (
                    <span>🚫 <strong>{excludedContacts.length}</strong> টি কন্টাক্ট বর্তমানে ব্লক করা আছে।</span>
                  )}
                  {aiConfigTab === 'platforms' && (
                    <span>🌐 <strong>{Object.values(aiEnabledPlatforms).filter(Boolean).length}</strong> টি চ্যানেলে এআই চালু রয়েছে।</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAiConfigModal(false)}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  >
                    বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAiConfig}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>সেটিংস সংরক্ষণ করুন</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
