import React, { useState, useEffect } from 'react';
import SocialMediaTopNav from './SocialMediaTopNav';
import {
  Bot,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  ShoppingBag,
  Tag,
  Clock,
  ChevronRight,
  Play,
  RotateCw,
  Facebook,
  Instagram,
  Music2,
  Youtube,
  X,
  Layers,
  Filter,
  Eye,
  Check,
  Flame,
  Zap,
  Ticket
} from 'lucide-react';
import { CommentAutomationRule, CommentExecutionLog, SocialPlatformId, SOCIAL_PLATFORMS } from '../../types/social';
import {
  fetchCommentRules,
  saveCommentRule,
  deleteCommentRule,
  subscribeToCommentRules,
  fetchCommentLogs,
  logCommentExecution
} from '../../services/socialDb';

// Quick Keyword Suggestions for 1-click addition
const SUGGESTED_KEYWORDS = ['price', 'দাম কত', 'দাম', 'order', 'details', 'link', 'অর্ডার', 'কত', 'সাইজ', 'delivery'];

// Pre-built default rule to ensure the screen is NEVER empty
const DEFAULT_INITIAL_RULE: CommentAutomationRule = {
  id: 'rule_default_1',
  name: 'Price & Order Auto Reply (দাম ও অর্ডার ইনবক্স)',
  platforms: ['facebook', 'instagram', 'tiktok', 'youtube'],
  keywords: ['price', 'দাম কত', 'দাম', 'order', 'details', 'link', 'অর্ডার'],
  matchType: 'contains',
  publicReplies: [
    'ধন্যবাদ আপনার আগ্রহের জন্য! আপনার ইনবক্সে বিস্তারিত ও অর্ডার লিংক পাঠিয়ে দেওয়া হয়েছে ✅',
    'ইনবক্স চেক করুন! সম্পূর্ণ অফার মূল্য ও ডিসকাউন্ট ভাউচার পাঠানো হয়েছে 📩',
    'অর্ডার লিংক ও ডেলিভারি তথ্য আপনার ইনবক্সে পাঠানো হয়েছে 🚀'
  ],
  sendPrivateDm: true,
  privateDmMessage: 'হ্যালো {customer_name}! আমাদের এই প্রোডাক্টটির বিশেষ অফার মূল্য {price} টাকা। সারাদেশে ক্যাশ অন ডেলিভারি ও ফ্রি হোম ডেলিভারি সুবিধা রয়েছে। নিচের লিংকে এখনই অর্ডার করুন: {order_link}',
  includeProductCard: true,
  productName: 'প্রিমিয়াম কালেকশন (Special Edition)',
  productPrice: 1850,
  couponCode: 'SAVE10',
  checkoutUrl: 'https://smartpos.cloud/checkout',
  isActive: true,
  createdAt: new Date().toISOString(),
  triggerCount: 14
};

export default function AutoCommentDmRulesPage() {
  const [rules, setRules] = useState<CommentAutomationRule[]>([]);
  const [logs, setLogs] = useState<CommentExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Active subview or tab
  const [activeTab, setActiveTab] = useState<'all' | 'builder' | 'simulator' | 'logs'>('all');

  // Form State for creating / editing rule
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleName, setRuleName] = useState('Price & Order Auto Reply (দাম ও অর্ডার ইনবক্স)');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatformId[]>(['facebook', 'instagram', 'tiktok']);
  const [keywords, setKeywords] = useState<string[]>(['price', 'দাম কত', 'দাম', 'order', 'details', 'link', 'অর্ডার']);
  const [keywordInput, setKeywordInput] = useState('');
  const [matchType, setMatchType] = useState<'contains' | 'exact'>('contains');
  
  // Rotating public replies
  const [publicReplies, setPublicReplies] = useState<string[]>([
    'ধন্যবাদ আপনার আগ্রহের জন্য! আপনার ইনবক্সে বিস্তারিত ও অর্ডার লিংক পাঠিয়ে দেওয়া হয়েছে ✅',
    'ইনবক্স চেক করুন! সম্পূর্ণ অফার মূল্য ও ডিসকাউন্ট ভাউচার পাঠানো হয়েছে 📩',
    'অর্ডার লিংক ও ডেলিভারি তথ্য আপনার ইনবক্সে পাঠানো হয়েছে 🚀'
  ]);
  const [newReplyInput, setNewReplyInput] = useState('');

  // Private DM Config
  const [sendPrivateDm, setSendPrivateDm] = useState(true);
  const [privateDmMessage, setPrivateDmMessage] = useState(
    'হ্যালো {customer_name}! আমাদের এই প্রোডাক্টটির বিশেষ অফার মূল্য {price} টাকা। সারাদেশে ক্যাশ অন ডেলিভারি ও ফ্রি হোম ডেলিভারি সুবিধা রয়েছে। নিচের লিংকে এখনই অর্ডার করুন: {order_link}'
  );
  const [includeProductCard, setIncludeProductCard] = useState(true);
  const [productName, setProductName] = useState('প্রিমিয়াম কালেকশন (Special Edition)');
  const [productPrice, setProductPrice] = useState<number>(1850);
  const [couponCode, setCouponCode] = useState('SAVE10');
  const [checkoutUrl, setCheckoutUrl] = useState('https://smartpos.cloud/checkout');

  // Live Simulator State
  const [simPlatform, setSimPlatform] = useState<SocialPlatformId>('facebook');
  const [simCustomerName, setSimCustomerName] = useState('Rahim Ahmed');
  const [simComment, setSimComment] = useState('Bhaiya price koto? details please');
  const [simResult, setSimResult] = useState<{
    matchedRule: CommentAutomationRule | null;
    selectedReply: string | null;
    dmMessage: string | null;
  } | null>({
    matchedRule: DEFAULT_INITIAL_RULE,
    selectedReply: 'ধন্যবাদ আপনার আগ্রহের জন্য! আপনার ইনবক্সে বিস্তারিত ও অর্ডার লিংক পাঠিয়ে দেওয়া হয়েছে ✅',
    dmMessage: 'হ্যালো Rahim Ahmed! আমাদের এই প্রোডাক্টটির বিশেষ অফার মূল্য ৳1,850 টাকা। সারাদেশে ক্যাশ অন ডেলিভারি ও ফ্রি হোম ডেলিভারি সুবিধা রয়েছে। নিচের লিংকে এখনই অর্ডার করুন: https://smartpos.cloud/checkout\n🎟️ কুপন কোড: SAVE10 (অতিরিক্ত ডিসকাউন্ট)'
  });

  // Status Notification
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const unsub = subscribeToCommentRules((data) => {
      if (data.length === 0) {
        // Initialize default active rule so the page has immediate configuration
        saveCommentRule(DEFAULT_INITIAL_RULE);
        setRules([DEFAULT_INITIAL_RULE]);
      } else {
        setRules(data);
      }
      setLoading(false);
    });

    fetchCommentLogs().then(data => {
      if (data.length === 0) {
        const initLog: CommentExecutionLog = {
          id: 'log_init_1',
          ruleId: DEFAULT_INITIAL_RULE.id,
          ruleName: DEFAULT_INITIAL_RULE.name,
          platform: 'facebook',
          postTitleOrId: 'New Arrival Mega Offer Post',
          commenterName: 'Rahim Ahmed',
          commenterHandle: '@rahim.ahmed',
          commentText: 'Bhaiya price koto? details please',
          publicReplySent: 'ধন্যবাদ আপনার আগ্রহের জন্য! আপনার ইনবক্সে বিস্তারিত ও অর্ডার লিংক পাঠিয়ে দেওয়া হয়েছে ✅',
          privateDmStatus: 'sent',
          privateDmMessage: 'হ্যালো Rahim Ahmed! আমাদের এই প্রোডাক্টটির বিশেষ অফার মূল্য ৳1,850 টাকা।',
          timestamp: new Date().toISOString()
        };
        logCommentExecution(initLog);
        setLogs([initLog]);
      } else {
        setLogs(data);
      }
    });

    return () => unsub();
  }, []);

  const resetForm = () => {
    setEditingRuleId(null);
    setRuleName('');
    setSelectedPlatforms(['facebook', 'instagram']);
    setKeywords(['price', 'দাম কত']);
    setKeywordInput('');
    setMatchType('contains');
    setPublicReplies([
      'ধন্যবাদ! আপনার ইনবক্সে বিস্তারিত ও অর্ডার লিংক পাঠিয়ে দিয়েছি ✅',
      'ইনবক্স চেক করুন! সম্পূর্ণ অফার তথ্য ও ডিসকাউন্ট ভাউচার পাঠানো হয়েছে 📩'
    ]);
    setNewReplyInput('');
    setSendPrivateDm(true);
    setPrivateDmMessage(
      'হ্যালো {customer_name}! আমাদের এই প্রোডাক্টটির বিশেষ অফার মূল্য {price} টাকা। ফ্রি হোম ডেলিভারি পেতে নিচের লিংকে অর্ডার করুন: {order_link}'
    );
    setIncludeProductCard(true);
    setProductName('');
    setProductPrice(0);
    setCouponCode('');
    setCheckoutUrl('');
  };

  const handleStartEdit = (rule: CommentAutomationRule) => {
    setEditingRuleId(rule.id);
    setRuleName(rule.name);
    setSelectedPlatforms(rule.platforms);
    setKeywords(rule.keywords);
    setMatchType(rule.matchType);
    setPublicReplies(rule.publicReplies);
    setSendPrivateDm(rule.sendPrivateDm);
    setPrivateDmMessage(rule.privateDmMessage);
    setIncludeProductCard(rule.includeProductCard);
    setProductName(rule.productName || '');
    setProductPrice(rule.productPrice || 0);
    setCouponCode(rule.couponCode || '');
    setCheckoutUrl(rule.checkoutUrl || '');
    setActiveTab('builder');
  };

  const handleAddKeyword = (kw?: string) => {
    const toAdd = (kw || keywordInput).trim().toLowerCase();
    if (!toAdd) return;
    if (!keywords.includes(toAdd)) {
      setKeywords([...keywords, toAdd]);
    }
    if (!kw) setKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleAddPublicReply = () => {
    if (!newReplyInput.trim()) return;
    setPublicReplies([...publicReplies, newReplyInput.trim()]);
    setNewReplyInput('');
  };

  const handleRemovePublicReply = (idx: number) => {
    if (publicReplies.length <= 1) {
      alert('কমপক্ষে একটি পাবলিক কমেন্ট রিপ্লাই ভ্যারিয়েশন থাকতে হবে।');
      return;
    }
    setPublicReplies(publicReplies.filter((_, i) => i !== idx));
  };

  const togglePlatform = (p: SocialPlatformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleSaveRule = async () => {
    if (!ruleName.trim()) {
      setStatusMessage({ type: 'error', text: 'রুলের একটি নাম দিন (যেমন: Price & Order Auto DM)' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    if (keywords.length === 0) {
      setStatusMessage({ type: 'error', text: 'কমপক্ষে একটি ট্রিগার কীওয়ার্ড যুক্ত করুন (যেমন: price, দাম)' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    if (publicReplies.length === 0) {
      setStatusMessage({ type: 'error', text: 'কমপক্ষে একটি পাবলিক কমেন্ট রিপ্লাই লিখুন।' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    const ruleToSave: CommentAutomationRule = {
      id: editingRuleId || 'rule_' + Date.now(),
      name: ruleName,
      platforms: selectedPlatforms,
      keywords,
      matchType,
      publicReplies,
      sendPrivateDm,
      privateDmMessage,
      includeProductCard,
      productName: productName || undefined,
      productPrice: productPrice || undefined,
      couponCode: couponCode || undefined,
      checkoutUrl: checkoutUrl || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      triggerCount: editingRuleId ? (rules.find(r => r.id === editingRuleId)?.triggerCount || 0) : 0
    };

    await saveCommentRule(ruleToSave);
    setStatusMessage({
      type: 'success',
      text: editingRuleId ? 'অটো-কমেন্ট রুল সফলভাবে আপডেট হয়েছে!' : 'নতুন অটো-কমেন্ট ও ডিএম রুল সেভ ও একটিভ হয়েছে!'
    });
    setEditingRuleId(null);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleDeleteRule = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত এই অটোমেশন রুলটি মুছে ফেলতে চান?')) {
      await deleteCommentRule(id);
    }
  };

  const handleToggleRuleStatus = async (rule: CommentAutomationRule) => {
    const updated = { ...rule, isActive: !rule.isActive };
    await saveCommentRule(updated);
  };

  // Run Interactive Simulator
  const handleRunSimulator = async () => {
    if (!simComment.trim()) return;

    const lowerComment = simComment.toLowerCase().trim();
    let matched: CommentAutomationRule | null = null;

    for (const r of rules.filter(x => x.isActive && x.platforms.includes(simPlatform))) {
      const isMatch = r.matchType === 'exact'
        ? r.keywords.some(k => lowerComment === k)
        : r.keywords.some(k => lowerComment.includes(k));

      if (isMatch) {
        matched = r;
        break;
      }
    }

    if (matched) {
      // Pick rotating reply
      const randomIndex = Math.floor(Math.random() * matched.publicReplies.length);
      const chosenReply = matched.publicReplies[randomIndex];

      // Format private DM
      let formattedDm = matched.privateDmMessage
        .replace('{customer_name}', simCustomerName)
        .replace('{price}', matched.productPrice ? `৳${matched.productPrice.toLocaleString('en-BD')}` : 'বিশেষ অফার')
        .replace('{product_name}', matched.productName || 'আমাদের পণ্য')
        .replace('{order_link}', matched.checkoutUrl || 'https://smartpos.cloud/checkout')
        .replace('{coupon}', matched.couponCode || 'SAVE10');

      if (matched.couponCode) {
        formattedDm += `\n🎟️ কুপন কোড: ${matched.couponCode} (অতিরিক্ত ডিসকাউন্ট)`;
      }

      setSimResult({
        matchedRule: matched,
        selectedReply: chosenReply,
        dmMessage: matched.sendPrivateDm ? formattedDm : null
      });

      // Increment trigger count
      matched.triggerCount = (matched.triggerCount || 0) + 1;
      await saveCommentRule(matched);

      // Add to live log
      const newLog: CommentExecutionLog = {
        id: 'log_' + Date.now(),
        ruleId: matched.id,
        ruleName: matched.name,
        platform: simPlatform,
        postTitleOrId: 'Live Social Post Simulation',
        commenterName: simCustomerName,
        commenterHandle: '@' + simCustomerName.toLowerCase().replace(/\s+/g, '.'),
        commentText: simComment,
        publicReplySent: chosenReply,
        privateDmStatus: matched.sendPrivateDm ? 'sent' : 'disabled',
        privateDmMessage: matched.sendPrivateDm ? formattedDm : undefined,
        timestamp: new Date().toISOString()
      };
      await logCommentExecution(newLog);
      setLogs(prev => [newLog, ...prev]);
    } else {
      setSimResult({
        matchedRule: null,
        selectedReply: null,
        dmMessage: null
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. Global Social Media & WhatsApp Top Tab Navigation Bar */}
        <SocialMediaTopNav activeTab="auto_comment_dm" />

        {/* Main Header & Metrics Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2.5 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
                <Bot className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Auto Comment & DM Rules
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                    Comment-to-DM Engine
                  </span>
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  সোশ্যাল মিডিয়ার কমেন্টে স্বয়ংক্রিয় রোটেটিং রিপ্লাই এবং কাস্টমারের ইনবক্সে ইনস্ট্যান্ট প্রাইস ও অর্ডার লিংক পাঠান।
                </p>
              </div>
            </div>
          </div>

          {/* Quick Filter Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Full Dashboard
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'builder'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Rule Builder
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'simulator'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Live Tester
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'logs'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Logs ({logs.length})
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {statusMessage && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 transition-all ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <p className="text-sm font-medium">{statusMessage.text}</p>
          </div>
        )}

        {/* 2-COLUMN MAIN WORKSPACE: Rule Builder & Live Simulator */}
        {(activeTab === 'all' || activeTab === 'builder' || activeTab === 'simulator') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN: Rule Builder & Automation Config (7 cols) */}
            {(activeTab === 'all' || activeTab === 'builder') && (
              <div className={`${activeTab === 'builder' ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-6`}>
                
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600">
                        <Bot className="w-4 h-4" />
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {editingRuleId ? 'Edit Automation Rule' : 'Trigger Keyword & Reply Builder'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingRuleId && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
                        >
                          Cancel Edit
                        </button>
                      )}
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Engine Active
                      </span>
                    </div>
                  </div>

                  {/* 1. Rule Name & Platforms */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Rule Name (রুলের নাম) *
                      </label>
                      <input
                        type="text"
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        placeholder="যেমন: Price & Order Auto Reply"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                      />
                    </div>

                    {/* Platform Checkboxes */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                        Active Platforms:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['facebook', 'instagram', 'tiktok'] as SocialPlatformId[]).map((pid) => {
                          const isSelected = selectedPlatforms.includes(pid);
                          return (
                            <button
                              key={pid}
                              type="button"
                              onClick={() => togglePlatform(pid)}
                              className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 opacity-60'
                              }`}
                            >
                              <span>{SOCIAL_PLATFORMS[pid].name}</span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 2. Trigger Keyword Builder */}
                  <div className="space-y-2.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-purple-600" />
                        Trigger Keyword Filter (ট্রিগার কিওয়ার্ড) *
                      </label>
                      
                      {/* Exact vs Contains Toggle */}
                      <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-xs">
                        <button
                          type="button"
                          onClick={() => setMatchType('contains')}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                            matchType === 'contains'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Contains Keyword
                        </button>
                        <button
                          type="button"
                          onClick={() => setMatchType('exact')}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                            matchType === 'exact'
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          Exact Match
                        </button>
                      </div>
                    </div>

                    {/* Input to add custom keyword */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddKeyword();
                          }
                        }}
                        placeholder="কীওয়ার্ড লিখুন (যেমন: price, দাম, order, details) এবং Enter দিন"
                        className="flex-1 px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddKeyword()}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                      >
                        + Add
                      </button>
                    </div>

                    {/* 1-Click Suggestions */}
                    <div className="flex items-center gap-1 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Add:</span>
                      {SUGGESTED_KEYWORDS.map((skw) => (
                        <button
                          key={skw}
                          type="button"
                          onClick={() => handleAddKeyword(skw)}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-purple-900 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                        >
                          +{skw}
                        </button>
                      ))}
                    </div>

                    {/* Active Keyword Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      {keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 text-xs font-bold"
                        >
                          #{kw}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(kw)}
                            className="hover:text-rose-500 ml-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 3. Automated Rotating Comment Replies */}
                  <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <RotateCw className="w-3.5 h-3.5 text-purple-600" />
                        Rotating Public Comment Replies (রোটেটিং পাবলিক রিপ্লাই) *
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {publicReplies.length} Variations Active
                      </span>
                    </div>

                    {/* List of Variations */}
                    <div className="space-y-2">
                      {publicReplies.map((reply, index) => (
                        <div key={index} className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                          <span className="text-[10px] font-bold text-purple-600 mt-0.5">#{index + 1}</span>
                          <p className="text-xs text-slate-800 dark:text-slate-200 flex-1 leading-relaxed">
                            {reply}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemovePublicReply(index)}
                            className="text-slate-400 hover:text-rose-500 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add variation input */}
                    <div className="flex gap-2 pt-1">
                      <input
                        type="text"
                        value={newReplyInput}
                        onChange={(e) => setNewReplyInput(e.target.value)}
                        placeholder="আরেকটি নতুন রিপ্লাই ভ্যারিয়েশন লিখুন..."
                        className="flex-1 px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddPublicReply}
                        className="px-3.5 py-2 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-300"
                      >
                        + Add Variation
                      </button>
                    </div>
                  </div>

                  {/* 4. Comment-to-DM Private Inbox Push */}
                  <div className="space-y-3 p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sendDmCheck"
                          checked={sendPrivateDm}
                          onChange={(e) => setSendPrivateDm(e.target.checked)}
                          className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                        />
                        <label htmlFor="sendDmCheck" className="text-xs font-bold text-purple-900 dark:text-purple-100 cursor-pointer flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-purple-600" />
                          Social DM Instant Push (ইনস্ট্যান্ট ইনবক্স মেসেজ)
                        </label>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                        Messenger / IG Direct
                      </span>
                    </div>

                    {sendPrivateDm && (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Private DM Message Template:
                          </label>
                          <textarea
                            value={privateDmMessage}
                            onChange={(e) => setPrivateDmMessage(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 resize-y leading-relaxed"
                          />
                        </div>

                        {/* Product Card & Coupon Fields */}
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              Offer Price (৳ BDT):
                            </label>
                            <input
                              type="number"
                              value={productPrice || ''}
                              onChange={(e) => setProductPrice(Number(e.target.value))}
                              placeholder="1850"
                              className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                              Coupon Code:
                            </label>
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="SAVE10"
                              className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                            Direct Checkout / Order Link:
                          </label>
                          <input
                            type="text"
                            value={checkoutUrl}
                            onChange={(e) => setCheckoutUrl(e.target.value)}
                            placeholder="https://smartpos.cloud/checkout"
                            className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Save Rule Action */}
                  <div>
                    <button
                      type="button"
                      onClick={handleSaveRule}
                      className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {editingRuleId ? 'Update & Save Automation Rule' : 'Save & Activate Automation Rule'}
                    </button>
                  </div>

                </div>

              </div>
            )}

            {/* RIGHT COLUMN: Interactive Live Simulator & Mockup Preview (5 cols) */}
            {(activeTab === 'all' || activeTab === 'simulator') && (
              <div className={`${activeTab === 'simulator' ? 'lg:col-span-12' : 'lg:col-span-5'} space-y-5`}>
                
                {/* 1. Simulator Input Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-purple-600" />
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">Live Comment & DM Tester</h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Real-time Trigger Test</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Platform Select */}
                    <div className="flex gap-1.5">
                      {(['facebook', 'instagram', 'tiktok'] as SocialPlatformId[]).map(pid => (
                        <button
                          key={pid}
                          type="button"
                          onClick={() => setSimPlatform(pid)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                            simPlatform === pid
                              ? 'bg-purple-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {SOCIAL_PLATFORMS[pid].name.split(' ')[0]}
                        </button>
                      ))}
                    </div>

                    {/* Customer Name & Comment */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Customer Name:</label>
                        <input
                          type="text"
                          value={simCustomerName}
                          onChange={(e) => setSimCustomerName(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">Quick Sample:</label>
                        <select
                          onChange={(e) => setSimComment(e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                        >
                          <option value="Bhaiya price koto? details please">Price koto? details</option>
                          <option value="Order korte chai, link den">Order link den</option>
                          <option value="Product dam koto? courier charge koto?">Dam koto?</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Test Comment:</label>
                      <input
                        type="text"
                        value={simComment}
                        onChange={(e) => setSimComment(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleRunSimulator}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Trigger Comment-to-DM Bot Now
                    </button>
                  </div>
                </div>

                {/* 2. LIVE FEED MOCKUP PREVIEW */}
                {simResult && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                        1. Public Post Comment Reply
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-600">Auto Replied</span>
                    </div>

                    {/* Comment & Bot Thread */}
                    <div className="space-y-2.5 text-xs">
                      {/* Customer Comment Bubble */}
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                          {simCustomerName[0]}
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl rounded-tl-none max-w-xs text-xs">
                          <p className="font-bold text-slate-900 dark:text-white">{simCustomerName}</p>
                          <p className="text-slate-800 dark:text-slate-200">{simComment}</p>
                        </div>
                      </div>

                      {/* Bot Public Reply */}
                      <div className="flex items-start gap-2 pl-6">
                        <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-[10px]">
                          SP
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-950/80 p-2.5 rounded-2xl rounded-tl-none max-w-xs text-xs border border-purple-200 dark:border-purple-800">
                          <p className="font-bold text-purple-900 dark:text-purple-100 flex items-center gap-1 text-[11px]">
                            SmartPOS (Page Admin)
                            <span className="text-[9px] px-1 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded font-normal">Bot</span>
                          </p>
                          <p className="text-purple-900 dark:text-purple-200 mt-0.5">{simResult.selectedReply}</p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Private DM Preview */}
                    {simResult.dmMessage && (
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                            <Send className="w-3.5 h-3.5" />
                            2. Private Messenger DM Push
                          </p>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Sent to Inbox
                          </span>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                          <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {simResult.dmMessage}
                          </p>

                          {/* Price & Checkout Action */}
                          {simResult.matchedRule?.productPrice && (
                            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                  {simResult.matchedRule.productName || 'Featured Product'}
                                </p>
                                <p className="text-emerald-700 dark:text-emerald-300 font-bold">
                                  ৳{simResult.matchedRule.productPrice.toLocaleString('en-BD')}
                                </p>
                              </div>
                              <span className="px-3 py-1 rounded-md bg-emerald-600 text-white font-bold text-[10px]">
                                Order Now
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* ACTIVE RULES TABLE & LOGS SECTION */}
        {(activeTab === 'all' || activeTab === 'logs') && (
          <div className="space-y-6">
            
            {/* Active Rules Card List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-purple-600" />
                    Active Automation Rules ({rules.length})
                  </h3>
                  <p className="text-xs text-slate-400">বর্তমান সক্রিয় রুলসমূহ ও মোট ট্রিগার সংখ্যা</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab('builder');
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  + Add New Rule
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-xl border border-purple-100 dark:border-purple-900/40 bg-purple-50/20 dark:bg-purple-950/10 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rule.name}</h4>
                        <span className="text-[10px] text-purple-600 font-semibold">
                          Triggers: {rule.triggerCount || 0} times
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(rule)}
                          className="p-1 rounded text-slate-400 hover:text-purple-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {rule.keywords.slice(0, 4).map((kw, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium">
                          #{kw}
                        </span>
                      ))}
                      {rule.keywords.length > 4 && (
                        <span className="text-[10px] text-slate-400">+{rule.keywords.length - 4} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Public vs Private Response Logs Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-600" />
                    Public vs Private Response Logs ({logs.length})
                  </h3>
                  <p className="text-xs text-slate-400">কাস্টমার কমেন্ট, স্বয়ংক্রিয় পাবলিক রিপ্লাই ও মেসেঞ্জার ডিএম ডেলিভারির লাইভ হিস্ট্রি</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-500">
                    <tr>
                      <th className="p-3 font-semibold">Time & Platform</th>
                      <th className="p-3 font-semibold">Customer</th>
                      <th className="p-3 font-semibold">Comment Text</th>
                      <th className="p-3 font-semibold">Public Reply</th>
                      <th className="p-3 font-semibold">Private DM</th>
                      <th className="p-3 font-semibold">Triggered Rule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-bold text-slate-900 dark:text-white uppercase">{log.platform}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-slate-900 dark:text-white">{log.commenterName}</p>
                          <p className="text-[10px] text-slate-400">{log.commenterHandle || '-'}</p>
                        </td>
                        <td className="p-3 max-w-xs font-medium text-slate-800 dark:text-slate-200">
                          "{log.commentText}"
                        </td>
                        <td className="p-3 max-w-xs text-purple-700 dark:text-purple-300 font-medium">
                          {log.publicReplySent}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              log.privateDmStatus === 'sent'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                            }`}
                          >
                            {log.privateDmStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-500 whitespace-nowrap">
                          {log.ruleName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
