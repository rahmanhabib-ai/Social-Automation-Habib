import { doc, getDoc, setDoc, collection, getDocs, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { getDb } from '../lib/firebase';
import { SocialPost, CommentAutomationRule, CommentExecutionLog, OmniConversation, OmniMessage, CannedResponse, PlatformApiConfig } from '../types/social';

// Local storage fallback keys
const POSTS_STORAGE_KEY = 'social_media_posts_v1';
const RULES_STORAGE_KEY = 'social_comment_rules_v1';
const LOGS_STORAGE_KEY = 'social_comment_logs_v1';
const CONVERSATIONS_STORAGE_KEY = 'social_omni_conversations_v1';
const CANNED_RESPONSES_STORAGE_KEY = 'social_canned_responses_v1';
const API_CONFIG_STORAGE_KEY = 'social_platform_api_config_v1';

// Real Initial State
const initialPosts: SocialPost[] = [];
const initialRules: CommentAutomationRule[] = [];
const initialLogs: CommentExecutionLog[] = [];

// Initial Pre-Configured Live Conversations from social channels
const initialConversations: OmniConversation[] = [
  {
    id: 'conv_fb_1',
    customerName: 'Tanvir Hossain',
    customerHandle: '@tanvir.hossain',
    customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
    platform: 'facebook',
    lastMessage: 'ভাইয়া ডেলিভারি চার্জ কত এবং কতদিনে পাবো?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 1,
    autoPilotEnabled: true,
    isHandover: false,
    status: 'active',
    messages: [
      {
        id: 'msg_1',
        conversationId: 'conv_fb_1',
        sender: 'customer',
        senderName: 'Tanvir Hossain',
        text: 'আসসালামু আলাইকুম, আপনাদের শোরুমের ঠিকানা কোথায়?',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: 'msg_2',
        conversationId: 'conv_fb_1',
        sender: 'ai_bot',
        senderName: 'Smart AI Agent',
        text: 'ওয়ালাইকুম আসসালাম! আমাদের প্রধান অফিস: হাউজ ৪২, রোড ১১, বনানী, ঢাকা। সকাল ১০টা থেকে রাত ৮টা পর্যন্ত খোলা থাকে 📍',
        timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
        isAiGenerated: true,
        intent: 'location'
      },
      {
        id: 'msg_3',
        conversationId: 'conv_fb_1',
        sender: 'customer',
        senderName: 'Tanvir Hossain',
        text: 'ভাইয়া ডেলিভারি চার্জ কত এবং কতদিনে পাবো?',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      }
    ]
  },
  {
    id: 'conv_ig_2',
    customerName: 'Sadia Afrin',
    customerHandle: '@sadia_afrin_fashion',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    platform: 'instagram',
    lastMessage: 'পণ্য পছন্দ না হলে কি রিটার্ন করা যাবে?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    unreadCount: 0,
    autoPilotEnabled: true,
    isHandover: false,
    status: 'active',
    messages: [
      {
        id: 'msg_4',
        conversationId: 'conv_ig_2',
        sender: 'customer',
        senderName: 'Sadia Afrin',
        text: 'পণ্য পছন্দ না হলে কি রিটার্ন করা যাবে?',
        timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString()
      },
      {
        id: 'msg_5',
        conversationId: 'conv_ig_2',
        sender: 'ai_bot',
        senderName: 'Smart AI Agent',
        text: 'জ্বী সাদিয়া আপু! আমাদের ৭ দিনের ফ্রি রিটার্ন ও এক্সচেঞ্জ গ্যারান্টি আছে। কোনো সমস্যা হলে তাৎক্ষণিক চেঞ্জ করে নিতে পারবেন ✨',
        timestamp: new Date(Date.now() - 1000 * 60 * 21).toISOString(),
        isAiGenerated: true,
        intent: 'support'
      }
    ]
  },
  {
    id: 'conv_wa_3',
    customerName: 'Kazi Mahmud',
    customerHandle: '+880 1712-345678',
    customerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60',
    platform: 'whatsapp',
    lastMessage: 'আমি একজন মানুষের সাথে কথা বলতে চাই, জরুরি কমপ্লেইন আছে।',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    unreadCount: 1,
    autoPilotEnabled: false,
    isHandover: true,
    handoverReason: 'Customer requested human agent for complaint',
    status: 'pending',
    messages: [
      {
        id: 'msg_6',
        conversationId: 'conv_wa_3',
        sender: 'customer',
        senderName: 'Kazi Mahmud',
        text: 'আমি একজন মানুষের সাথে কথা বলতে চাই, জরুরি কমপ্লেইন আছে।',
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString()
      },
      {
        id: 'msg_7',
        conversationId: 'conv_wa_3',
        sender: 'ai_bot',
        senderName: 'Smart AI Agent',
        text: 'ধন্যবাদ! আপনার বিষয়টি আমাদের সিনিয়র কাস্টমার সাপোর্ট ম্যানেজারের কাছে হস্তান্তর করা হয়েছে। দ্রুতই আমাদের প্রতিনিধি আপনার সাথে কথা বলছেন 👨‍💼',
        timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
        isAiGenerated: true,
        intent: 'handover'
      }
    ]
  },
  {
    id: 'conv_tg_4',
    customerName: 'Arif Chowdhury',
    customerHandle: '@arif_bd',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    platform: 'telegram',
    lastMessage: 'ক্যাশ অন ডেলিভারি আছে নাকি আগে পেমেন্ট?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    unreadCount: 0,
    autoPilotEnabled: true,
    isHandover: false,
    status: 'active',
    messages: [
      {
        id: 'msg_8',
        conversationId: 'conv_tg_4',
        sender: 'customer',
        senderName: 'Arif Chowdhury',
        text: 'ক্যাশ অন ডেলিভারি আছে নাকি আগে পেমেন্ট?',
        timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString()
      },
      {
        id: 'msg_9',
        conversationId: 'conv_tg_4',
        sender: 'ai_bot',
        senderName: 'Smart AI Agent',
        text: 'জ্বী! সারাদেশে ১০০% ক্যাশ অন ডেলিভারি সুবিধা আছে। পার্সেল খুলে চেক করে তারপর টাকা দেওয়ার সুযোগ পাবেন 💵',
        timestamp: new Date(Date.now() - 1000 * 60 * 49).toISOString(),
        isAiGenerated: true,
        intent: 'order'
      }
    ]
  },
  {
    id: 'conv_tt_5',
    customerName: 'Nusrat Jahan',
    customerHandle: '@nusrat_vibes',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    platform: 'tiktok',
    lastMessage: 'টিকটক ভিডিওর ওই ড্রেসটার দাম কত?',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    unreadCount: 0,
    autoPilotEnabled: true,
    isHandover: false,
    status: 'active',
    messages: [
      {
        id: 'msg_10',
        conversationId: 'conv_tt_5',
        sender: 'customer',
        senderName: 'Nusrat Jahan',
        text: 'টিকটক ভিডিওর ওই ড্রেসটার দাম কত?',
        timestamp: new Date(Date.now() - 1000 * 60 * 80).toISOString()
      }
    ]
  },
  {
    id: 'conv_yt_6',
    customerName: 'Sabbir Ahmed (YouTube Commenter)',
    customerHandle: '@sabbir_yt_review',
    customerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
    platform: 'youtube',
    lastMessage: 'ভাইয়া ইউটিউব ভিডিওর প্রোডাক্টটি কি এখনো স্টকে আছে? ব্ল্যাক কালার নিতে চাই।',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    unreadCount: 1,
    autoPilotEnabled: true,
    isHandover: false,
    status: 'active',
    messages: [
      {
        id: 'msg_yt_1',
        conversationId: 'conv_yt_6',
        sender: 'customer',
        senderName: 'Sabbir Ahmed',
        text: 'ভাইয়া ইউটিউব ভিডিওর প্রোডাক্টটি কি এখনো স্টকে আছে? ব্ল্যাক কালার নিতে চাই।',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      },
      {
        id: 'msg_yt_2',
        conversationId: 'conv_yt_6',
        sender: 'ai_bot',
        senderName: 'Smart AI Agent',
        text: 'জ্বী ভাইয়া! ভিডিওর ব্ল্যাক কালারটি এখনো এভেইলেবল আছে। ক্যাশ অন ডেলিভারিতে অর্ডার করতে আপনার নাম, ঠিকানা ও ফোন নাম্বার লিখে মেসেজ দিন 🛍️',
        timestamp: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
        isAiGenerated: true,
        intent: 'order'
      }
    ]
  }
];

// Pre-built Canned Quick Replies
const initialCannedResponses: CannedResponse[] = [
  {
    id: 'can_1',
    title: 'ডেলিভারি চার্জ ও সময়',
    shortcut: '/delivery',
    text: 'আমাদের ডেলিভারি চার্জ ঢাকা সিটিতে ৬০ টাকা (২৪-৪৮ ঘণ্টা) এবং ঢাকার বাইরে ১২০ টাকা (৪৮-৭২ ঘণ্টা)। সারাদেশে ক্যাশ অন ডেলিভারি সুবিধা রয়েছে 🚚',
    category: 'delivery'
  },
  {
    id: 'can_2',
    title: 'অর্ডার করার নিয়ম',
    shortcut: '/order',
    text: 'অর্ডার কনফার্ম করতে অনুগ্রহ করে আপনার নাম, সম্পূর্ণ ঠিকানা এবং মোবাইল নাম্বারটি লিখে পাঠান 🛍️',
    category: 'order'
  },
  {
    id: 'can_3',
    title: 'বিকাশ ও পেমেন্ট তথ্য',
    shortcut: '/payment',
    text: 'আপনি ক্যাশ অন ডেলিভারিতে অথবা আমাদের মার্চেন্ট বিকাশ/নগদে পেমেন্ট করতে পারেন। পণ্য হাতে পেয়ে চেক করার সুযোগ রয়েছে 💵',
    category: 'pricing'
  },
  {
    id: 'can_4',
    title: 'হিউম্যান হ্যান্ডওভার মেসেজ',
    shortcut: '/handover',
    text: 'ধন্যবাদ আপনার ধৈর্যের জন্য! আমাদের একজন সিনিয়র সাপোর্ট অফিসার দ্রুতই আপনার সাথে কথা বলছেন 👨‍💼',
    category: 'support'
  },
  {
    id: 'can_5',
    title: 'রিটার্ন ও এক্সচেঞ্জ পলিসি',
    shortcut: '/return',
    text: 'আমাদের রয়েছে ৭ দিনের সহজ এক্সচেঞ্জ ও রিটার্ন গ্যারান্টি। কোনো সাইজ বা কোয়ালিটি সমস্যা থাকলে সাথে সাথে সমাধান দেওয়া হয় ✅',
    category: 'support'
  }
];

// Asynchronous sync to Cloud SQL PostgreSQL
function syncToCloudSql(key: string, value: any) {
  try {
    if (typeof window !== 'undefined') {
      fetch('/api/system/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: typeof value === 'string' ? value : JSON.stringify(value) })
      }).catch(() => {});
    }
  } catch {}
}

// Helper to get local posts
function getLocalPosts(): SocialPost[] {
  try {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(initialPosts));
      return initialPosts;
    }
    return JSON.parse(raw);
  } catch {
    return initialPosts;
  }
}

function saveLocalPosts(posts: SocialPost[]) {
  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.warn('Direct save to local storage exceeded quota, applying smart compaction...', e);
    try {
      // Retain the latest 25 posts, stripping large inline base64 if needed
      const compacted: SocialPost[] = posts.slice(0, 25).map(p => {
        const media = (p.mediaUrls || []).map(m => {
          if (m && m.length > 50000 && m.startsWith('data:')) {
            return '';
          }
          return m;
        }).filter(Boolean);
        const singleMedia = p.mediaUrl && p.mediaUrl.length > 50000 && p.mediaUrl.startsWith('data:')
          ? ''
          : p.mediaUrl;
        return {
          ...p,
          mediaUrls: media,
          mediaUrl: singleMedia
        };
      });
      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(compacted));
    } catch (compactErr) {
      try {
        // Fallback: preserve essential post metadata
        const minimal: SocialPost[] = posts.slice(0, 15).map(p => ({
          ...p,
          mediaUrls: [],
          mediaUrl: undefined
        }));
        localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(minimal));
      } catch (finalErr) {
        console.warn('LocalStorage quota limit reached, skipping local cache write.');
      }
    }
  }
  syncToCloudSql(POSTS_STORAGE_KEY, posts.slice(0, 50));
}

// Rules Local storage helpers
function getLocalRules(): CommentAutomationRule[] {
  try {
    const raw = localStorage.getItem(RULES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(initialRules));
      return initialRules;
    }
    return JSON.parse(raw);
  } catch {
    return initialRules;
  }
}

function saveLocalRules(rules: CommentAutomationRule[]) {
  try {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
  } catch (e) {
    console.error('Failed to save rules to local storage', e);
  }
  syncToCloudSql(RULES_STORAGE_KEY, rules);
}

// Logs Local storage helpers
function getLocalLogs(): CommentExecutionLog[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(initialLogs));
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch {
    return initialLogs;
  }
}

function saveLocalLogs(logs: CommentExecutionLog[]) {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (e) {
    try {
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 30)));
    } catch {
      console.warn('LocalStorage quota exceeded for logs');
    }
  }
  syncToCloudSql(LOGS_STORAGE_KEY, logs.slice(0, 50));
}

export async function fetchSocialPosts(): Promise<SocialPost[]> {
  const db = getDb();
  if (!db) {
    return getLocalPosts();
  }

  try {
    const colRef = collection(db, 'social_posts');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getLocalPosts();
    }
    const list: SocialPost[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    saveLocalPosts(list);
    return list;
  } catch (err) {
    console.warn('Firestore fetchSocialPosts fallback to localStorage:', err);
    return getLocalPosts();
  }
}

export async function saveSocialPost(post: SocialPost): Promise<void> {
  const current = getLocalPosts();
  const index = current.findIndex(p => p.id === post.id);
  if (index >= 0) {
    current[index] = post;
  } else {
    current.unshift(post);
  }
  saveLocalPosts(current);

  const db = getDb();
  if (db) {
    try {
      const docRef = doc(db, 'social_posts', post.id);
      await setDoc(docRef, post, { merge: true });
    } catch (err) {
      console.warn('Firestore saveSocialPost error:', err);
    }
  }
}

export async function deleteSocialPost(postId: string): Promise<void> {
  const current = getLocalPosts().filter(p => p.id !== postId);
  saveLocalPosts(current);

  const db = getDb();
  if (db) {
    try {
      const docRef = doc(db, 'social_posts', postId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteSocialPost error:', err);
    }
  }
}

export function subscribeToSocialPosts(callback: (posts: SocialPost[]) => void): () => void {
  const db = getDb();
  if (!db) {
    callback(getLocalPosts());
    return () => {};
  }

  try {
    const colRef = collection(db, 'social_posts');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list: SocialPost[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      if (list.length > 0) {
        saveLocalPosts(list);
        callback(list);
      } else {
        callback(getLocalPosts());
      }
    }, (err) => {
      console.warn('Firestore onSnapshot error:', err);
      callback(getLocalPosts());
    });
  } catch (err) {
    console.warn('Firestore subscription failed:', err);
    callback(getLocalPosts());
    return () => {};
  }
}

// ---------------- Comment Automation Rules ----------------
export async function fetchCommentRules(): Promise<CommentAutomationRule[]> {
  const db = getDb();
  if (!db) {
    return getLocalRules();
  }
  try {
    const colRef = collection(db, 'social_comment_rules');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getLocalRules();
    }
    const list: CommentAutomationRule[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    saveLocalRules(list);
    return list;
  } catch (err) {
    return getLocalRules();
  }
}

export async function saveCommentRule(rule: CommentAutomationRule): Promise<void> {
  const current = getLocalRules();
  const index = current.findIndex(r => r.id === rule.id);
  if (index >= 0) {
    current[index] = rule;
  } else {
    current.unshift(rule);
  }
  saveLocalRules(current);

  const db = getDb();
  if (db) {
    try {
      const docRef = doc(db, 'social_comment_rules', rule.id);
      await setDoc(docRef, rule, { merge: true });
    } catch (err) {
      console.warn('Firestore saveCommentRule error:', err);
    }
  }
}

export async function deleteCommentRule(ruleId: string): Promise<void> {
  const current = getLocalRules().filter(r => r.id !== ruleId);
  saveLocalRules(current);

  const db = getDb();
  if (db) {
    try {
      const docRef = doc(db, 'social_comment_rules', ruleId);
      await deleteDoc(docRef);
    } catch (err) {
      console.warn('Firestore deleteCommentRule error:', err);
    }
  }
}

export function subscribeToCommentRules(callback: (rules: CommentAutomationRule[]) => void): () => void {
  const db = getDb();
  if (!db) {
    callback(getLocalRules());
    return () => {};
  }
  try {
    const colRef = collection(db, 'social_comment_rules');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list: CommentAutomationRule[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      if (list.length > 0) {
        saveLocalRules(list);
        callback(list);
      } else {
        callback(getLocalRules());
      }
    }, (err) => {
      callback(getLocalRules());
    });
  } catch (err) {
    callback(getLocalRules());
    return () => {};
  }
}

// ---------------- Comment Execution Logs ----------------
export async function fetchCommentLogs(): Promise<CommentExecutionLog[]> {
  const db = getDb();
  if (!db) {
    return getLocalLogs();
  }
  try {
    const colRef = collection(db, 'social_comment_logs');
    const q = query(colRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getLocalLogs();
    }
    const list: CommentExecutionLog[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    saveLocalLogs(list);
    return list;
  } catch (err) {
    return getLocalLogs();
  }
}

export async function logCommentExecution(log: CommentExecutionLog): Promise<void> {
  const current = getLocalLogs();
  current.unshift(log);
  saveLocalLogs(current);

  const db = getDb();
  if (db) {
    try {
      const docRef = doc(db, 'social_comment_logs', log.id);
      await setDoc(docRef, log, { merge: true });
    } catch (err) {
      console.warn('Firestore logCommentExecution error:', err);
    }
  }
}

// ---------------- Omnichannel Conversations ----------------
function getLocalConversations(): OmniConversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(initialConversations));
      return initialConversations;
    }
    return JSON.parse(raw);
  } catch {
    return initialConversations;
  }
}

function saveLocalConversations(convs: OmniConversation[]) {
  try {
    localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(convs.slice(0, 50)));
  } catch (e) {
    try {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(convs.slice(0, 20)));
    } catch {
      console.warn('LocalStorage quota exceeded for conversations');
    }
  }
  syncToCloudSql(CONVERSATIONS_STORAGE_KEY, convs.slice(0, 50));
}

export async function fetchOmniConversations(): Promise<OmniConversation[]> {
  const db = getDb();
  if (!db) {
    return getLocalConversations();
  }
  try {
    const colRef = collection(db, 'social_omni_conversations');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return getLocalConversations();
    }
    const list: OmniConversation[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    saveLocalConversations(list);
    return list;
  } catch (err) {
    return getLocalConversations();
  }
}

export async function saveOmniConversation(conv: OmniConversation): Promise<void> {
  const current = getLocalConversations();
  const index = current.findIndex(c => c.id === conv.id);
  if (index >= 0) {
    current[index] = conv;
  } else {
    current.unshift(conv);
  }
  saveLocalConversations(current);

  const db = getDb();
  if (db) {
    try {
      const docRef = doc(db, 'social_omni_conversations', conv.id);
      await setDoc(docRef, conv, { merge: true });
    } catch (err) {
      console.warn('Firestore saveOmniConversation error:', err);
    }
  }
}

export function subscribeToOmniConversations(callback: (convs: OmniConversation[]) => void): () => void {
  const db = getDb();
  if (!db) {
    callback(getLocalConversations());
    return () => {};
  }
  try {
    const colRef = collection(db, 'social_omni_conversations');
    return onSnapshot(colRef, (snapshot) => {
      const list: OmniConversation[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...(docSnap.data() as any) });
      });
      if (list.length > 0) {
        saveLocalConversations(list);
        callback(list);
      } else {
        callback(getLocalConversations());
      }
    }, () => {
      callback(getLocalConversations());
    });
  } catch {
    callback(getLocalConversations());
    return () => {};
  }
}

// ---------------- Canned Responses ----------------
function getLocalCanned(): CannedResponse[] {
  try {
    const raw = localStorage.getItem(CANNED_RESPONSES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CANNED_RESPONSES_STORAGE_KEY, JSON.stringify(initialCannedResponses));
      return initialCannedResponses;
    }
    return JSON.parse(raw);
  } catch {
    return initialCannedResponses;
  }
}

function saveLocalCanned(canned: CannedResponse[]) {
  try {
    localStorage.setItem(CANNED_RESPONSES_STORAGE_KEY, JSON.stringify(canned));
  } catch (e) {
    console.error('Failed to save canned to local storage', e);
  }
  syncToCloudSql(CANNED_RESPONSES_STORAGE_KEY, canned);
}

export async function fetchCannedResponses(): Promise<CannedResponse[]> {
  const db = getDb();
  if (!db) {
    return getLocalCanned();
  }
  try {
    const colRef = collection(db, 'social_canned_responses');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return getLocalCanned();
    }
    const list: CannedResponse[] = [];
    snapshot.forEach(docSnap => {
      list.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    saveLocalCanned(list);
    return list;
  } catch (err) {
    return getLocalCanned();
  }
}

export async function saveCannedResponse(canned: CannedResponse): Promise<void> {
  const current = getLocalCanned();
  const index = current.findIndex(c => c.id === canned.id);
  if (index >= 0) {
    current[index] = canned;
  } else {
    current.push(canned);
  }
  saveLocalCanned(current);

  const db = getDb();
  if (db) {
    try {
      const docRef = doc(db, 'social_canned_responses', canned.id);
      await setDoc(docRef, canned, { merge: true });
    } catch (err) {
      console.warn('Firestore saveCannedResponse error:', err);
    }
  }
}

// ---------------- Platform API Settings ----------------
export const defaultPlatformApiConfig: PlatformApiConfig = {
  meta: {
    appId: '1092847192837461',
    appSecret: '••••••••••••••••••••••••••••••••',
    pageAccessToken: 'EAAGm0PX4ZCpsBAK7ZCZC8...long_lived_token',
    pageId: '108492048172948',
    instagramAccountId: '17841400293847291',
    verifyToken: 'meta_webhook_secret_verify_token_2026',
    isConnected: true,
    lastPingStatus: 'success',
    lastPingTime: new Date().toISOString()
  },
  telegram: {
    authMode: 'qr',
    userSessionString: '',
    userPhone: '',
    userName: '',
    userUsername: '',
    userId: '',
    isUserConnected: false,
    botToken: '',
    channelUsernameOrId: '',
    adminChatId: '',
    targetChannels: [],
    isConnected: false,
    lastPingStatus: 'pending',
    lastPingTime: ''
  },
  tiktok: {
    clientKey: 'aw82js9102ks8201',
    clientSecret: '••••••••••••••••••••••••••••••••',
    creatorAccountId: 'act_tiktok_business_7829',
    accessToken: 'tt_act_token_long_lived_7281',
    isConnected: true,
    lastPingStatus: 'success',
    lastPingTime: new Date().toISOString()
  },
  youtube: {
    apiKey: '',
    clientId: '',
    clientSecret: '',
    channelId: '',
    channelTitle: '',
    channelHandle: '',
    subscriberCount: '',
    accessToken: '',
    refreshToken: '',
    isConnected: false,
    lastPingStatus: 'pending',
    lastPingTime: ''
  },
  whatsapp: {
    mode: 'builtin',
    gatewayUrl: '',
    apiKey: '',
    channelId: '',
    baileysSessionId: '',
    connectedPhone: '',
    isConnected: false,
    lastPingStatus: 'pending',
    lastPingTime: ''
  },
  webhooks: {
    metaWebhookUrl: 'https://api.domain.com/api/webhooks/meta-graph',
    telegramWebhookUrl: 'https://api.domain.com/api/webhooks/telegram-bot',
    tiktokWebhookUrl: 'https://api.domain.com/api/webhooks/tiktok-events',
    whatsappWebhookUrl: 'https://api.domain.com/api/webhooks/baileys-events'
  }
};

function getLocalApiConfig(): PlatformApiConfig {
  try {
    const raw = localStorage.getItem(API_CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(API_CONFIG_STORAGE_KEY, JSON.stringify(defaultPlatformApiConfig));
      return defaultPlatformApiConfig;
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaultPlatformApiConfig,
      ...parsed,
      telegram: {
        ...defaultPlatformApiConfig.telegram,
        ...(parsed.telegram || {}),
        targetChannels: Array.isArray(parsed.telegram?.targetChannels) ? parsed.telegram.targetChannels : []
      },
      whatsapp: {
        ...defaultPlatformApiConfig.whatsapp,
        ...(parsed.whatsapp || {})
      },
      meta: {
        ...defaultPlatformApiConfig.meta,
        ...(parsed.meta || {})
      },
      tiktok: {
        ...defaultPlatformApiConfig.tiktok,
        ...(parsed.tiktok || {})
      },
      youtube: {
        ...defaultPlatformApiConfig.youtube,
        ...(parsed.youtube || {})
      }
    };
  } catch {
    return defaultPlatformApiConfig;
  }
}

function saveLocalApiConfig(config: PlatformApiConfig) {
  try {
    localStorage.setItem(API_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save API config to local storage', e);
  }
  syncToCloudSql(API_CONFIG_STORAGE_KEY, config);
}

export async function fetchPlatformApiConfig(): Promise<PlatformApiConfig> {
  let localData = getLocalApiConfig();

  // Try fetching from server file storage
  try {
    const res = await fetch('/api/platform-config');
    if (res.ok) {
      const serverData = await res.json();
      if (serverData.success && serverData.config) {
        localData = {
          ...defaultPlatformApiConfig,
          ...localData,
          ...serverData.config,
          telegram: {
            ...defaultPlatformApiConfig.telegram,
            ...(localData.telegram || {}),
            ...(serverData.config.telegram || {}),
            targetChannels: Array.isArray(serverData.config.telegram?.targetChannels) 
              ? serverData.config.telegram.targetChannels 
              : (Array.isArray(localData.telegram?.targetChannels) ? localData.telegram.targetChannels : [])
          }
        };
        saveLocalApiConfig(localData);
      }
    }
  } catch (e) {
    // Ignore server fetch error and continue
  }

  const db = getDb();
  if (!db) {
    return localData;
  }
  try {
    const docRef = doc(db, 'social_platform_settings', 'main_config');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as PlatformApiConfig;
      const merged: PlatformApiConfig = {
        ...defaultPlatformApiConfig,
        ...localData,
        ...data,
        telegram: {
          ...defaultPlatformApiConfig.telegram,
          ...(localData.telegram || {}),
          ...(data.telegram || {}),
          targetChannels: Array.isArray(data.telegram?.targetChannels) 
            ? data.telegram.targetChannels 
            : (Array.isArray(localData.telegram?.targetChannels) ? localData.telegram.targetChannels : [])
        }
      };
      saveLocalApiConfig(merged);
      return merged;
    }
    return localData;
  } catch (err) {
    return localData;
  }
}

export async function savePlatformApiConfig(config: PlatformApiConfig): Promise<void> {
  // 1. Save to local storage immediately
  saveLocalApiConfig(config);

  // 2. Save to server persistent json file
  try {
    await fetch('/api/platform-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config })
    });
  } catch (e) {
    console.warn('Could not save to /api/platform-config:', e);
  }

  // 3. Save to Firestore
  const db = getDb();
  if (db) {
    try {
      const docRef = doc(db, 'social_platform_settings', 'main_config');
      await setDoc(docRef, config, { merge: true });
    } catch (err) {
      console.warn('Firestore savePlatformApiConfig error:', err);
    }
  }
}
