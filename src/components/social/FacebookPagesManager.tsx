import React, { useState, useEffect } from 'react';
import {
  Facebook, CheckCircle2, AlertCircle, RefreshCw, Trash2, Plus, ExternalLink,
  ShieldCheck, Send, Users, Layers, Key, Eye, EyeOff, Radio, Copy, Check, MessageSquare, Image, Sparkles
} from 'lucide-react';

export interface MetaPage {
  id: string;
  name: string;
  category?: string;
  picture?: string;
  accessToken: string;
  isPermanent: boolean;
  followersCount?: number;
  fanCount?: number;
  instagramAccountId?: string;
  instagramUsername?: string;
  instagramProfilePic?: string;
  whatsappNumber?: string;
  link?: string;
  tasks?: string[];
  isActive: boolean;
  connectedAt: string;
  lastSyncedAt: string;
}

export interface MetaGroup {
  id: string;
  name: string;
  picture?: string;
  privacy?: string;
  memberCount?: number;
  administrator: boolean;
  linkedPageId?: string;
  isActive: boolean;
  connectedAt: string;
}

export interface MetaUser {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  longLivedUserToken?: string;
  tokenExpiresAt?: string;
  connectedAt: string;
}

export const FacebookPagesManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pages, setPages] = useState<MetaPage[]>([]);
  const [groups, setGroups] = useState<MetaGroup[]>([]);
  const [user, setUser] = useState<MetaUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Developer Config
  const [appId, setAppId] = useState('');
  const [appSecret, setAppSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [showDevSettings, setShowDevSettings] = useState(false);

  // Manual Add Form
  const [manualPageId, setManualPageId] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [showManualForm, setShowManualForm] = useState(false);

  // Test Post Modal
  const [testModalTarget, setTestModalTarget] = useState<{ type: 'page' | 'group'; id: string; name: string } | null>(null);
  const [testMessage, setTestMessage] = useState('🌟 SmartPOS এআই সিস্টেম থেকে সফলভাবে লাইভ টেস্ট পোস্ট করা হয়েছে! #MetaAutomatedPost');
  const [testImageUrl, setTestImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccessMsg, setPostSuccessMsg] = useState<string | null>(null);
  const [postErrorMsg, setPostErrorMsg] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load status on mount
  const fetchMetaStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/meta/pages');
      const data = await res.json();
      if (data.success) {
        setIsConnected(data.isConnected);
        setUser(data.user || null);
        setPages(data.pages || []);
        setGroups(data.groups || []);
      }
    } catch (e) {
      console.error('Failed to fetch Meta status:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetaStatus();

    // Check if coming back from OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleOAuthCodeExchange(code);
      // Clean URL parameter
      window.history.replaceState({}, document.title, window.location.pathname + '?tab=meta');
    }
  }, []);

  const handleOAuthCodeExchange = async (code: string) => {
    setSyncing(true);
    try {
      const res = await fetch('/api/meta/oauth/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          redirectUri: `${window.location.origin}/admin/controller?tab=meta&oauth=callback`
        })
      });
      const data = await res.json();
      if (data.success) {
        setPostSuccessMsg(`সফলভাবে ${data.pagesCount || 0}টি ফেসবুক পেজ ও ${data.groupsCount || 0}টি গ্রুপ যুক্ত হয়েছে!`);
        fetchMetaStatus();
      } else {
        setPostErrorMsg(`লগইন ব্যর্থ হয়েছে: ${data.error}`);
      }
    } catch (err: any) {
      setPostErrorMsg(err.message || 'OAuth বিনিময় ব্যর্থ হয়েছে');
    } finally {
      setSyncing(false);
    }
  };

  // Launch 1-Click Facebook OAuth Popup / Window
  const handleConnectClick = async () => {
    setSyncing(true);
    try {
      const redirectUri = `${window.location.origin}/admin/controller?tab=meta&oauth=callback`;
      const res = await fetch(`/api/meta/oauth/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      const data = await res.json();

      if (data.url) {
        // Open Facebook Login Dialog
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
          data.url,
          'facebook_oauth_window',
          `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
        );

        if (!popup) {
          // If popup blocked, redirect directly
          window.location.href = data.url;
        } else {
          // Poll for popup closing or completion
          const timer = setInterval(() => {
            if (popup.closed) {
              clearInterval(timer);
              setSyncing(false);
              fetchMetaStatus();
            }
          }, 1000);
        }
      }
    } catch (e: any) {
      setPostErrorMsg('OAuth লিংক তৈরিতে ত্রুটি: ' + e.message);
      setSyncing(false);
    }
  };

  const handleTogglePage = async (pageId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/meta/pages/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, isActive: !currentStatus })
      });
      const data = await res.json();
      if (data.success) {
        setPages(pages.map(p => p.id === pageId ? { ...p, isActive: !currentStatus } : p));
      }
    } catch (e) {
      console.error('Failed to toggle page:', e);
    }
  };

  const handleRemovePage = async (pageId: string) => {
    if (!confirm('আপনি কি নিশ্চিত যে আপনি এই ফেসবুক পেজটি আনলিঙ্ক করতে চান?')) return;
    try {
      const res = await fetch(`/api/meta/pages/${pageId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPages(pages.filter(p => p.id !== pageId));
      }
    } catch (e) {
      console.error('Failed to delete page:', e);
    }
  };

  const handleDisconnectAll = async () => {
    if (!confirm('আপনি কি নিশ্চিত যে সমস্ত ফেসবুক পেজ ও অ্যাকাউন্ট সংযোগ বিচ্ছিন্ন করতে চান?')) return;
    setLoading(true);
    try {
      await fetch('/api/meta/disconnect', { method: 'POST' });
      setUser(null);
      setPages([]);
      setGroups([]);
      setIsConnected(false);
      setPostSuccessMsg('সমস্ত ফেসবুক অ্যাকাউন্ট সফলভাবে আনলিঙ্ক করা হয়েছে।');
    } catch (e) {
      console.error('Disconnect failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPageId || !manualToken) return;

    setLoading(true);
    try {
      const res = await fetch('/api/meta/pages/add-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: manualPageId, pageAccessToken: manualToken })
      });
      const data = await res.json();
      if (data.success) {
        setPostSuccessMsg(data.message);
        setManualPageId('');
        setManualToken('');
        setShowManualForm(false);
        fetchMetaStatus();
      } else {
        setPostErrorMsg(data.error);
      }
    } catch (err: any) {
      setPostErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendLiveTestPost = async () => {
    if (!testModalTarget) return;
    setIsPosting(true);
    setPostSuccessMsg(null);
    setPostErrorMsg(null);

    try {
      const endpoint = testModalTarget.type === 'page' ? '/api/meta/publish' : '/api/meta/groups/publish';
      const body = testModalTarget.type === 'page'
        ? { pageId: testModalTarget.id, message: testMessage, imageUrl: testImageUrl }
        : { groupId: testModalTarget.id, message: testMessage, imageUrl: testImageUrl };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (data.success) {
        setPostSuccessMsg(`সফলভাবে পোস্ট পাবলিশ হয়েছে! পোস্ট আইডি: ${data.postId}`);
        if (data.permalink) {
          window.open(data.permalink, '_blank');
        }
      } else {
        setPostErrorMsg(`পোস্ট ব্যর্থ হয়েছে: ${data.error}`);
      }
    } catch (err: any) {
      setPostErrorMsg(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Alert Notices */}
      {postSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{postSuccessMsg}</span>
          </div>
          <button onClick={() => setPostSuccessMsg(null)} className="font-bold underline">✕</button>
        </div>
      )}

      {postErrorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{postErrorMsg}</span>
          </div>
          <button onClick={() => setPostErrorMsg(null)} className="font-bold underline">✕</button>
        </div>
      )}

      {/* Main Header & 1-Click Connect Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-xl shadow-blue-500/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner">
              <Facebook className="w-8 h-8 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">Meta Facebook & Instagram Hub</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-900">
                  Never-Expiring Tokens
                </span>
              </div>
              <p className="text-xs text-blue-100/80 mt-1 max-w-xl">
                ১-ক্লিকে আনলিমিটেড ফেসবুক পেজ ও গ্রুপ কানেক্ট করুন। কোনো ক্লায়েন্টকে API Key কপি করতে হবে না।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleConnectClick}
              disabled={syncing}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-blue-50 text-blue-700 font-black text-xs flex items-center gap-2 shadow-lg shadow-black/10 transition-all active:scale-95"
            >
              <Facebook className={`w-4 h-4 ${syncing ? 'animate-spin' : 'fill-current'}`} />
              <span>{syncing ? 'সিঙ্ক্রোনাইজ হচ্ছে...' : '🔵 ১-ক্লিক Facebook Login'}</span>
            </button>

            <button
              type="button"
              onClick={fetchMetaStatus}
              disabled={loading}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {isConnected && (
              <button
                type="button"
                onClick={handleDisconnectAll}
                className="px-3.5 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-bold transition-all"
              >
                আনলিঙ্ক করুন
              </button>
            )}
          </div>
        </div>

        {/* User Card if connected */}
        {user && (
          <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full border-2 border-white/30" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                  {user.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>{user.name}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </p>
                <p className="text-[11px] text-blue-200">{user.email || 'Facebook Verified User'}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-blue-100">
              <div>
                <span className="block text-[10px] text-blue-300 uppercase font-bold">কানেক্টেড পেজ</span>
                <span className="text-base font-black text-white">{pages.length} টি</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="block text-[10px] text-blue-300 uppercase font-bold">কানেক্টেড গ্রুপ</span>
                <span className="text-base font-black text-white">{groups.length} টি</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <span className="block text-[10px] text-blue-300 uppercase font-bold">টোকেন লাইফটাইম</span>
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> চিরস্থায়ী (Never Expires)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connected Pages Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>সংযুক্ত ফেসবুক পেজসমূহ ({pages.length})</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              এই পেজগুলোতে স্বয়ংক্রিয় এআই পোস্ট, শিডিউল পাবলিশ ও অটো-কমেন্ট পরিচালিত হবে।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowManualForm(!showManualForm)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{showManualForm ? 'ফর্ম বন্ধ করুন' : 'ম্যানুয়াল পেজ টোকেন'}</span>
            </button>
          </div>
        </div>

        {/* Manual Page Form Dropdown */}
        {showManualForm && (
          <form onSubmit={handleManualAdd} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">ম্যানুয়ালি পেজ টোকেন দিয়ে পেজ যুক্ত করুন:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                value={manualPageId}
                onChange={e => setManualPageId(e.target.value)}
                placeholder="Facebook Page ID (e.g. 10928374619)"
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                required
              />
              <input
                type="text"
                value={manualToken}
                onChange={e => setManualToken(e.target.value)}
                placeholder="Page Access Token (EAAG...)"
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
              >
                পেজ ভেরিফাই ও যুক্ত করুন
              </button>
            </div>
          </form>
        )}

        {/* Page Cards Grid */}
        {pages.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto">
              <Facebook className="w-6 h-6" />
            </div>
            <h5 className="font-bold text-sm text-slate-700 dark:text-slate-300">কোনো ফেসবুক পেজ যুক্ত নেই</h5>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              উপরের <strong>"১-ক্লিক Facebook Login"</strong> বাটনে ক্লিক করে এক নিমেষেই আপনার সমস্ত পেজ সিঙ্ক করে নিন।
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pages.map((p) => (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all ${
                  p.isActive
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700'
                    : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {p.picture ? (
                      <img src={p.picture} alt={p.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                        {p.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{p.name}</h5>
                      <span className="text-[11px] text-slate-500">{p.category || 'Facebook Page'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePage(p.id, p.isActive)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      p.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        p.isActive ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Meta details */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Page ID:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(p.id, p.id)}
                      className="font-mono text-slate-700 dark:text-slate-300 font-bold hover:text-blue-600 flex items-center gap-1"
                    >
                      <span>{p.id}</span>
                      {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-slate-500">
                    <span>ফলোয়ার:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{(p.followersCount || p.fanCount || 0).toLocaleString()} জন</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Never-Expiring Token
                    </span>
                    {p.instagramUsername && (
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                        IG: @{p.instagramUsername}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setTestModalTarget({ type: 'page', id: p.id, name: p.name })}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>টেস্ট পোস্ট করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemovePage(p.id)}
                    className="p-1.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition-all"
                    title="পেজ রিমুভ করুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected Facebook Groups Section */}
      {groups.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>সংযুক্ত ফেসবুক গ্রুপসমূহ ({groups.length})</span>
              </h4>
              <p className="text-xs text-slate-500">
                আপনার অ্যাডমিন থাকা গ্রুপগুলোতে এক ক্লিকে পোস্ট ব্রডকাস্ট করুন।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(g => (
              <div key={g.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center gap-3">
                  {g.picture ? (
                    <img src={g.picture} alt={g.name} className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                      {g.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{g.name}</h5>
                    <span className="text-[10px] text-slate-400">{g.privacy} • {g.memberCount ? `${g.memberCount} সদস্য` : 'সক্রিয়'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setTestModalTarget({ type: 'group', id: g.id, name: g.name })}
                  className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>গ্রুপে টেস্ট পোস্ট পাঠান</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Live Post Modal */}
      {testModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">লাইভ পোস্ট পরীক্ষা (Live Test Post)</h4>
                  <p className="text-[11px] text-slate-500">টার্গেট: <strong>{testModalTarget.name}</strong> ({testModalTarget.type.toUpperCase()})</p>
                </div>
              </div>
              <button onClick={() => setTestModalTarget(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ক্যাপশন / পোস্ট বার্তা:</label>
                <textarea
                  rows={4}
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">ইমেজ লিংক (ঐচ্ছিক):</label>
                <input
                  type="url"
                  value={testImageUrl}
                  onChange={e => setTestImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTestModalTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleSendLiveTestPost}
                disabled={isPosting || !testMessage}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
              >
                <Send className={`w-3.5 h-3.5 ${isPosting ? 'animate-spin' : ''}`} />
                <span>{isPosting ? 'পাবলিশ হচ্ছে...' : 'এখনই পোস্ট করুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
