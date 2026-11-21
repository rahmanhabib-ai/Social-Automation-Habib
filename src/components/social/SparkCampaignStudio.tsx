import React, { useState, useEffect } from 'react';
import {
  Sparkles, Play, Pause, Trash2, Plus, Clock, RefreshCw, Send, CheckCircle2,
  AlertCircle, Facebook, Radio, ExternalLink, Calendar, ChevronRight, Layers,
  Check, X, Image as ImageIcon, Tag, Eye, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';

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
  times: string[];
  intervalHours?: number;
  targetPlatforms: {
    facebookPages: string[];
    facebookGroups: string[];
    telegramChats: string[];
    whatsappTargets: string[];
  };
  isActive: boolean;
  totalRuns: number;
  createdAt: string;
  lastRunAt?: string;
  nextRunAt?: string;
  lastLogs?: any[];
}

export const SparkCampaignStudio: React.FC = () => {
  const [campaigns, setCampaigns] = useState<SparkCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState<string | null>(null);

  // Available Connected Channels
  const [metaPages, setMetaPages] = useState<Array<{ id: string; name: string; picture?: string }>>([]);
  const [metaGroups, setMetaGroups] = useState<Array<{ id: string; name: string }>>([]);
  const [waTargets, setWaTargets] = useState<Array<{ id: string; name: string; type: string }>>([]);
  const [tgTargets, setTgTargets] = useState<Array<{ id: string; name: string }>>([]);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [topicPrompt, setTopicPrompt] = useState('');
  const [tone, setTone] = useState<'promotional' | 'urgent_deal' | 'storytelling' | 'casual'>('urgent_deal');
  const [generateBanner, setGenerateBanner] = useState(true);
  const [bannerTheme, setBannerTheme] = useState<'blue_gradient' | 'cyber_purple' | 'emerald_glow' | 'sunset_orange' | 'dark_luxury'>('blue_gradient');
  const [productPrice, setProductPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [scheduleType, setScheduleType] = useState<'daily' | 'interval_hours'>('daily');
  const [timesInput, setTimesInput] = useState('10:00, 18:00');
  const [intervalHours, setIntervalHours] = useState('6');

  // Selected Target Channels for New Campaign
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedWa, setSelectedWa] = useState<string[]>([]);
  const [selectedTg, setSelectedTg] = useState<string[]>([]);

  // Logs / Execution Modal
  const [activeLogModal, setActiveLogModal] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/spark/campaigns');
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error('Failed to fetch Spark campaigns:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectedChannels = async () => {
    // 1. Fetch Meta Facebook Pages & Groups
    try {
      const metaRes = await fetch('/api/meta/pages');
      const metaData = await metaRes.json();
      if (metaData.success) {
        setMetaPages(metaData.pages || []);
        setMetaGroups(metaData.groups || []);
        // Pre-select all active pages by default
        if (selectedPages.length === 0 && Array.isArray(metaData.pages)) {
          setSelectedPages(metaData.pages.filter((p: any) => p.isActive).map((p: any) => p.id));
        }
      }
    } catch (e) {}

    // 2. Fetch WhatsApp Channels
    try {
      const waRes = await fetch('/api/whatsapp/channels');
      const waData = await waRes.json();
      if (Array.isArray(waData.channels)) {
        setWaTargets(waData.channels);
      }
    } catch (e) {}

    // 3. Fetch Telegram Targets
    try {
      const storedTg = localStorage.getItem('app_telegram_targets');
      if (storedTg) setTgTargets(JSON.parse(storedTg));
    } catch (e) {}
  };

  useEffect(() => {
    fetchCampaigns();
    fetchConnectedChannels();
    const interval = setInterval(fetchCampaigns, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/spark/campaigns/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(campaigns.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
        setStatusMessage({ type: 'success', text: data.message });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (e) {
      console.error('Toggle error:', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('আপনি কি এই ক্যাম্পেইনটি ডিলিট করতে চান?')) return;
    try {
      const res = await fetch(`/api/spark/campaigns/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCampaigns(campaigns.filter(c => c.id !== id));
      }
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const handleRunNow = async (id: string) => {
    setExecutingId(id);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/spark/campaigns/${id}/run-now`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        setActiveLogModal(data.log);
        fetchCampaigns();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Execution failed' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setExecutingId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !topicPrompt) return;

    const times = timesInput.split(',').map(t => t.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/spark/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          topicPrompt,
          tone,
          language: 'bangla',
          generateBanner,
          bannerTheme,
          productPrice: productPrice ? Number(productPrice) : undefined,
          discountPrice: discountPrice ? Number(discountPrice) : undefined,
          brandName: 'SMART POS',
          scheduleType,
          times,
          intervalHours: intervalHours ? Number(intervalHours) : 6,
          targetPlatforms: {
            facebookPages: selectedPages,
            facebookGroups: selectedGroups,
            telegramChats: selectedTg,
            whatsappTargets: selectedWa
          },
          isActive: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        setShowCreateModal(false);
        // Reset form
        setName('');
        setTopicPrompt('');
        fetchCampaigns();
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl text-xs flex items-center justify-between border ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="font-bold underline">✕</button>
        </div>
      )}

      {/* Spark Automation Hero */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 text-white shadow-xl shadow-purple-500/10 space-y-6 border border-purple-800/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 backdrop-blur-md flex items-center justify-center text-purple-300 border border-purple-400/30 shadow-inner">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">Spark AI Multi-Channel Campaign Scheduler</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-400 text-slate-950">
                  Zero Human Effort
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
                জেমিনি এআই স্বয়ংক্রিয়ভাবে প্রম্পট অনুযায়ী আকর্ষণীয় পোস্ট ও ব্যানার তৈরি করে নির্দিষ্ট সময়ে ফেসবুক পেজ, গ্রুপ, টেলিগ্রাম ও হোয়াটসঅ্যাপে একযোগে পোস্ট করবে।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন এআই ক্যাম্পেইন তৈরি করুন</span>
            </button>

            <button
              type="button"
              onClick={fetchCampaigns}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Metric Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="block text-[10px] text-purple-300 uppercase font-bold">মোট ক্যাম্পেইন</span>
            <span className="text-xl font-black text-white">{campaigns.length} টি</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="block text-[10px] text-emerald-300 uppercase font-bold">সক্রিয় অটোমেশন</span>
            <span className="text-xl font-black text-emerald-400">
              {campaigns.filter(c => c.isActive).length} টি
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="block text-[10px] text-blue-300 uppercase font-bold">মোট এক্সিকিউশন</span>
            <span className="text-xl font-black text-white">
              {campaigns.reduce((acc, c) => acc + (c.totalRuns || 0), 0)} বার
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="block text-[10px] text-amber-300 uppercase font-bold">ডিস্ট্রিবিউশন হাব</span>
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1 mt-1">
              <Zap className="w-3.5 h-3.5" /> 4-in-1 Omni
            </span>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {campaigns.map((c) => (
          <div
            key={c.id}
            className={`p-6 rounded-3xl border transition-all ${
              c.isActive
                ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                : 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-slate-900 dark:text-white">{c.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    c.isActive
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {c.isActive ? '● সক্রিয়' : 'স্থগিত'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">{c.topicPrompt}</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggle(c.id, c.isActive)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  c.isActive ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    c.isActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Campaign Meta Details */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>
                  {c.scheduleType === 'daily'
                    ? `প্রতিদিন: ${c.times.join(', ')}`
                    : `প্রতি ${c.intervalHours || 6} ঘণ্টা পর`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>{c.generateBanner ? '🎨 এআই ব্যানার সক্রিয়' : 'শুধু টেক্সট'}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>টোন: {c.tone.replace('_', ' ')}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>রান হয়েছে: <strong>{c.totalRuns} বার</strong></span>
              </div>
            </div>

            {/* Target Networks Preview */}
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">টার্গেট:</span>
                <div className="flex items-center gap-1">
                  {(c.targetPlatforms.facebookPages?.length || 0) > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                      {c.targetPlatforms.facebookPages.length} FB Pages
                    </span>
                  )}
                  {(c.targetPlatforms.telegramChats?.length || 0) > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-bold text-[10px]">
                      {c.targetPlatforms.telegramChats.length} Telegram
                    </span>
                  )}
                  {(c.targetPlatforms.whatsappTargets?.length || 0) > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      {c.targetPlatforms.whatsappTargets.length} WhatsApp
                    </span>
                  )}
                </div>
              </div>

              {c.nextRunAt && (
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                  পরবর্তী রান: {new Date(c.nextRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleRunNow(c.id)}
                disabled={executingId === c.id}
                className="flex-1 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${executingId === c.id ? 'animate-spin' : ''}`} />
                <span>{executingId === c.id ? 'পোস্ট ও ব্যানার তৈরি হচ্ছে...' : '⚡ এখনই রান ও টেস্ট করুন'}</span>
              </button>

              {c.lastLogs && c.lastLogs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveLogModal(c.lastLogs![0])}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold"
                  title="সর্বশেষ এক্সিকিউশন ফলাফল দেখুন"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                title="ক্যাম্পেইন মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">নতুন Spark AI অটোমেশন ক্যাম্পেইন তৈরি</h3>
                  <p className="text-xs text-slate-500">শিডিউল অনুযায়ী স্বয়ংক্রিয় এআই কন্টেন্ট তৈরি ও মাল্টি-চ্যানেল পোস্টিং</p>
                </div>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ক্যাম্পেইনের নাম:</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="যেমন: উইকেন্ড স্পেশাল সেলস বুস্টার"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">এআই প্রম্পট / টপিক বা নির্দেশিকা:</label>
                <textarea
                  rows={3}
                  value={topicPrompt}
                  onChange={e => setTopicPrompt(e.target.value)}
                  placeholder="যেমন: প্রিমিয়াম গ্যাজেট ও অ্যাক্সেসরিজের উপর স্পেশাল ২০% ছাড়, ক্যাশ অন ডেলিভারি"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">টোন (Tone):</label>
                  <select
                    value={tone}
                    onChange={e => setTone(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="urgent_deal">⚡ ফ্ল্যাশ ডিসকাউন্ট (Urgent Deal)</option>
                    <option value="promotional">🔥 আকর্ষণীয় সেলস অফার (Promotional)</option>
                    <option value="storytelling">📖 স্টোরিটেলিং ও ফিচারস (Storytelling)</option>
                    <option value="casual">💬 ফ্রেন্ডলি ও ইনফরমাল (Casual)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ব্যানার থিম:</label>
                  <select
                    value={bannerTheme}
                    onChange={e => setBannerTheme(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="blue_gradient">🔵 Royal Blue Gradient</option>
                    <option value="dark_luxury">⚫ Dark Luxury Gold</option>
                    <option value="cyber_purple">🟣 Cyber Purple Glow</option>
                    <option value="emerald_glow">🟢 Emerald Green</option>
                    <option value="sunset_orange">🟠 Sunset Orange</option>
                  </select>
                </div>
              </div>

              {/* Schedule Configuration */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>শিডিউল টাইমিং (Posting Schedule):</span>
                </h5>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">শিডিউল ধরন:</label>
                    <select
                      value={scheduleType}
                      onChange={e => setScheduleType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                    >
                      <option value="daily">প্রতিদিন নির্দিষ্ট সময়ে (Daily)</option>
                      <option value="interval_hours">নির্দিষ্ট ঘণ্টা পর পর (Interval)</option>
                    </select>
                  </div>

                  <div>
                    {scheduleType === 'daily' ? (
                      <div>
                        <label className="block text-slate-500 mb-1">পোস্টিং টাইম (কমা দিয়ে একাধিক):</label>
                        <input
                          type="text"
                          value={timesInput}
                          onChange={e => setTimesInput(e.target.value)}
                          placeholder="e.g. 10:00, 15:30, 20:00"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-slate-500 mb-1">কত ঘণ্টা পর পর:</label>
                        <input
                          type="number"
                          value={intervalHours}
                          onChange={e => setIntervalHours(e.target.value)}
                          placeholder="6"
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Target Distribution Channels */}
              <div className="space-y-3">
                <label className="block font-bold text-slate-800 dark:text-slate-200">টার্গেট পাবলিশিং প্ল্যাটফর্ম সিলেক্ট করুন:</label>

                {/* Facebook Pages */}
                {metaPages.length > 0 && (
                  <div className="p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                    <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                      <Facebook className="w-3.5 h-3.5" /> Facebook Pages ({metaPages.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {metaPages.map(p => (
                        <label key={p.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedPages.includes(p.id)}
                            onChange={e => {
                              setSelectedPages(e.target.checked ? [...selectedPages, p.id] : selectedPages.filter(id => id !== p.id));
                            }}
                            className="rounded text-blue-600"
                          />
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* WhatsApp Targets */}
                {waTargets.length > 0 && (
                  <div className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                    <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                      <Radio className="w-3.5 h-3.5" /> WhatsApp Channels & Groups ({waTargets.length})
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {waTargets.map(w => (
                        <label key={w.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedWa.includes(w.id)}
                            onChange={e => {
                              setSelectedWa(e.target.checked ? [...selectedWa, w.id] : selectedWa.filter(id => id !== w.id));
                            }}
                            className="rounded text-emerald-600"
                          />
                          <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{w.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black shadow-lg shadow-purple-600/20"
                >
                  ক্যাম্পেইন সেভ ও শিডিউল করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE EXECUTION PREVIEW MODAL */}
      {activeLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">এক্সিকিউশন ও পাবলিশিং ফলাফল</h4>
                  <p className="text-[11px] text-slate-500">{activeLogModal.campaignName} • {new Date(activeLogModal.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
              <button onClick={() => setActiveLogModal(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-purple-600 dark:text-purple-400">{activeLogModal.generatedHeadline}</h5>
                <p className="text-slate-700 dark:text-slate-300 line-clamp-4 whitespace-pre-wrap">{activeLogModal.generatedCaption}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">চ্যানেল ভিত্তিক স্ট্যাটাস:</span>
                <div className="space-y-1.5">
                  {activeLogModal.results?.map((r: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <span className="font-bold uppercase text-[10px] text-slate-600 dark:text-slate-400">{r.platform} ({r.targetId})</span>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        r.status === 'ok'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {r.status === 'ok' ? '✓ পোস্ট সম্পন্ন' : `✕ ব্যর্থ: ${r.error || 'Unknown'}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveLogModal(null)}
                className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
