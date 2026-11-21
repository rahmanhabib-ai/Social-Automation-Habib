import React, { useState } from 'react';
import { 
  Home, 
  Sliders, 
  Layout, 
  Sparkles, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  MoveUp, 
  MoveDown, 
  ExternalLink, 
  Save, 
  Layers, 
  Globe, 
  Shield, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Bot, 
  Zap, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  HelpCircle,
  BarChart3,
  Server,
  Database,
  Star,
  RefreshCw,
  Copy
} from 'lucide-react';
import { useSidebar, NavItem, FeatureItem } from '../context/SidebarContext';

type SubSection = 'header' | 'hero' | 'portals' | 'about' | 'features' | 'contact' | 'footer';

const AVAILABLE_ICONS = [
  'Sliders', 'Shield', 'Bot', 'Zap', 'Lock', 'Globe', 'Database', 'Star', 
  'BarChart3', 'Server', 'Layout', 'Sparkles', 'Phone', 'Mail', 'Layers'
];

export default function HomepageControl() {
  const { 
    homepageConfig, 
    updateHomepageConfig, 
    saveToCloud, 
    isSaving,
    resetToDefaults 
  } = useSidebar();

  const [activeSubSection, setActiveSubSection] = useState<SubSection>('header');
  const [saveToast, setSaveToast] = useState(false);

  const handleSave = () => {
    saveToCloud();
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Nav Links helper
  const addNavLink = () => {
    const newId = `nav_${Date.now()}`;
    const newLinks: NavItem[] = [
      ...homepageConfig.header.navLinks,
      { id: newId, label: 'নতুন মেনু', href: '#section', isVisible: true }
    ];
    updateHomepageConfig({
      header: {
        ...homepageConfig.header,
        navLinks: newLinks
      }
    });
  };

  const updateNavLink = (id: string, updates: Partial<NavItem>) => {
    const newLinks = homepageConfig.header.navLinks.map(link => 
      link.id === id ? { ...link, ...updates } : link
    );
    updateHomepageConfig({
      header: {
        ...homepageConfig.header,
        navLinks: newLinks
      }
    });
  };

  const deleteNavLink = (id: string) => {
    const newLinks = homepageConfig.header.navLinks.filter(link => link.id !== id);
    updateHomepageConfig({
      header: {
        ...homepageConfig.header,
        navLinks: newLinks
      }
    });
  };

  // Feature Items helper
  const addFeatureItem = () => {
    const newId = `feat_${Date.now()}`;
    const newItems: FeatureItem[] = [
      ...homepageConfig.features.items,
      {
        id: newId,
        icon: 'Zap',
        title: 'নতুন ফিচার বা সার্ভিস',
        description: 'এই ফিচারের সুবিধা ও বিস্তারিত বিবরণ এখানে লিখুন।'
      }
    ];
    updateHomepageConfig({
      features: {
        ...homepageConfig.features,
        items: newItems
      }
    });
  };

  const updateFeatureItem = (id: string, updates: Partial<FeatureItem>) => {
    const newItems = homepageConfig.features.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    updateHomepageConfig({
      features: {
        ...homepageConfig.features,
        items: newItems
      }
    });
  };

  const deleteFeatureItem = (id: string) => {
    const newItems = homepageConfig.features.items.filter(item => item.id !== id);
    updateHomepageConfig({
      features: {
        ...homepageConfig.features,
        items: newItems
      }
    });
  };

  // Highlights helper for Hero
  const addHeroHighlight = () => {
    const highlights = [...homepageConfig.hero.highlights, 'নতুন হাইলাইট টেক্সট'];
    updateHomepageConfig({
      hero: {
        ...homepageConfig.hero,
        highlights
      }
    });
  };

  const updateHeroHighlight = (idx: number, val: string) => {
    const highlights = [...homepageConfig.hero.highlights];
    highlights[idx] = val;
    updateHomepageConfig({
      hero: {
        ...homepageConfig.hero,
        highlights
      }
    });
  };

  const deleteHeroHighlight = (idx: number) => {
    const highlights = homepageConfig.hero.highlights.filter((_, i) => i !== idx);
    updateHomepageConfig({
      hero: {
        ...homepageConfig.hero,
        highlights
      }
    });
  };

  const subSections: { id: SubSection; label: string; icon: any; badge?: string }[] = [
    { id: 'header', label: '১. হেডার ও মেনু নেভিগেশন', icon: Layout, badge: 'Header' },
    { id: 'hero', label: '২. হিরো ব্যানার সেকশন', icon: Sparkles, badge: 'Hero' },
    { id: 'portals', label: '৩. পোর্টাল আর্কিটেকচার কার্ডস', icon: Shield, badge: 'Portals' },
    { id: 'about', label: '৪. প্রযুক্তি পরিচিতি (About)', icon: Globe, badge: 'About' },
    { id: 'features', label: '৫. ফিচার ও সার্ভিস মডিউলস', icon: Zap, badge: `${homepageConfig.features.items.length} Items` },
    { id: 'contact', label: '৬. কন্টাক্ট ইনফো ও ফর্ম', icon: Phone, badge: 'Support' },
    { id: 'footer', label: '৭. ফুটার ও কপিরাইট', icon: Layers, badge: 'Footer' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-28">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-indigo-950/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black tracking-widest uppercase inline-block border border-indigo-500/30">
              HOMEPAGE & VIP HEADER CONTROL
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" /> লাইভ কন্ট্রোল
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Home className="w-7 h-7 text-indigo-400" />
            হোমপেজ ও হেডার কন্ট্রোল সেন্টার
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1.5 font-medium max-w-2xl leading-relaxed">
            পাবলিক হোমপেজের হেডার লোগো, নেভিগেশন মেনু, হিরো ব্যানার, পোর্টাল কার্ড, পরিচিতি, ফিচার গ্রিড, কন্টাক্ট এবং ফুটার টেক্সট সবকিছু এখান থেকেই ডায়নামিকালি পরিবর্তন ও নিয়ন্ত্রণ করুন।
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm border border-white/10 transition-all cursor-pointer shadow-sm"
          >
            <Eye className="w-4 h-4 text-cyan-300" />
            লাইভ হোমপেজ প্রিভিউ
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'সেভ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
          </button>
        </div>
      </div>

      {/* Sub-Section Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
        {subSections.map(sub => {
          const Icon = sub.icon;
          const isActive = activeSubSection === sub.id;
          return (
            <button
              key={sub.id}
              onClick={() => setActiveSubSection(sub.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-300' : 'text-slate-400'}`} />
              <span>{sub.label}</span>
              {sub.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {sub.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: HEADER & NAV MENU */}
      {activeSubSection === 'header' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-indigo-600" />
                  ব্র্যান্ড লোগো ও হেডার আইডেন্টিটি
                </h3>
                <p className="text-xs text-slate-500">হোমপেজের উপরে থাকা ব্রান্ড টাইটেল ও সাবটাইটেল</p>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={homepageConfig.header.showLogoIcon}
                  onChange={(e) => updateHomepageConfig({
                    header: { ...homepageConfig.header, showLogoIcon: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                />
                <span>লোগো আইকন প্রদর্শন করুন</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ব্র্যান্ড টাইটেল (Brand Title):
                </label>
                <input
                  type="text"
                  value={homepageConfig.header.brandTitle}
                  onChange={(e) => updateHomepageConfig({
                    header: { ...homepageConfig.header, brandTitle: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm focus:bg-white focus:border-indigo-500 outline-none"
                  placeholder="যেমন: Smart Commerce Enterprise"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ব্র্যান্ড সাবটাইটেল বা ট্যাগ (Brand Subtitle):
                </label>
                <input
                  type="text"
                  value={homepageConfig.header.brandSubtitle}
                  onChange={(e) => updateHomepageConfig({
                    header: { ...homepageConfig.header, brandSubtitle: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm focus:bg-white focus:border-indigo-500 outline-none"
                  placeholder="যেমন: Unified Operating System"
                />
              </div>
            </div>
          </div>

          {/* Header Action Buttons Control */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-600" />
                হেডার কুইক অ্যাকশন বাটনসমূহ (Header Buttons)
              </h3>
              <p className="text-xs text-slate-500">হেডারের ডানপাশে থাকা লগইন বা পোর্টাল এন্ট্রি বাটন কাস্টমাইজেশন</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Login Button */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-xs text-emerald-900">ইউজার লগইন বাটন</span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={homepageConfig.header.showUserLoginBtn}
                      onChange={(e) => updateHomepageConfig({
                        header: { ...homepageConfig.header, showUserLoginBtn: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                    />
                    <span>বাটন প্রদর্শন করুন</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={homepageConfig.header.userLoginBtnText}
                  onChange={(e) => updateHomepageConfig({
                    header: { ...homepageConfig.header, userLoginBtnText: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-semibold text-emerald-950 focus:border-emerald-500 outline-none"
                  placeholder="বাটন লেবেল"
                />
              </div>

              {/* Admin Portal Button */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-700" />
                    <span className="font-bold text-xs text-indigo-900">অ্যাডমিন পোর্টাল বাটন</span>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-bold text-indigo-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={homepageConfig.header.showAdminLoginBtn}
                      onChange={(e) => updateHomepageConfig({
                        header: { ...homepageConfig.header, showAdminLoginBtn: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                    />
                    <span>বাটন প্রদর্শন করুন</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={homepageConfig.header.adminLoginBtnText}
                  onChange={(e) => updateHomepageConfig({
                    header: { ...homepageConfig.header, adminLoginBtnText: e.target.value }
                  })}
                  className="w-full px-3.5 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-semibold text-indigo-950 focus:border-indigo-500 outline-none"
                  placeholder="বাটন লেবেল"
                />
              </div>
            </div>
          </div>

          {/* Nav Menu Items List Manager */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  নেভিগেশন মেনু লিংকসমূহ (Navbar Menu Links)
                </h3>
                <p className="text-xs text-slate-500">হোমপেজ হেডারে প্রদর্শিত নেভিগেশন লিংকগুলোর ক্রম ও টার্গেট সেকশন</p>
              </div>
              <button
                onClick={addNavLink}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                নতুন লিংক যোগ করুন
              </button>
            </div>

            <div className="space-y-3">
              {homepageConfig.header.navLinks.map((link, idx) => (
                <div 
                  key={link.id} 
                  className={`p-3.5 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-all ${
                    link.isVisible ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <button
                      onClick={() => updateNavLink(link.id, { isVisible: !link.isVisible })}
                      title={link.isVisible ? 'হাইড করুন' : 'প্রদর্শন করুন'}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        link.isVisible ? 'text-indigo-600 hover:bg-indigo-100' : 'text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {link.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">মেনু লেবেল (Label):</span>
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateNavLink(link.id, { label: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:border-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">লিংক টার্গেট (Href URL):</span>
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) => updateNavLink(link.id, { href: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-xs text-indigo-900 focus:border-indigo-500 outline-none"
                        placeholder="#hero / #portals / https://..."
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => deleteNavLink(link.id)}
                    title="মুছে ফেলুন"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors self-end md:self-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HERO BANNER */}
      {activeSubSection === 'hero' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                হিরো ব্যানার সেকশন (Hero Section)
              </h3>
              <p className="text-xs text-slate-500">হোমপেজের মূল ওয়েলকাম হেডলাইন, সাবটেক্সট এবং কল-টু-অ্যাকশন বাটন</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={homepageConfig.hero.showHero}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, showHero: e.target.checked }
                })}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <span>হিরো সেকশন সক্রিয় রাখুন</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                উপরে থাকা পিল ব্যাজ টেক্সট (Badge Text):
              </label>
              <input
                type="text"
                value={homepageConfig.hero.badgeText}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, badgeText: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                প্রধান শিরোনাম (Main Headline):
              </label>
              <input
                type="text"
                value={homepageConfig.hero.headline}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, headline: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-black text-sm md:text-base focus:bg-white focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                সাবটেক্সট ও পরিচিতি বিবরণ (Subtext):
              </label>
              <textarea
                rows={3}
                value={homepageConfig.hero.subtext}
                onChange={(e) => updateHomepageConfig({
                  hero: { ...homepageConfig.hero, subtext: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs md:text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none leading-relaxed"
              />
            </div>

            {/* Buttons Setup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                <span className="font-bold text-xs text-emerald-900 block">১ম অ্যাকশন বাটন (Primary CTA):</span>
                <input
                  type="text"
                  value={homepageConfig.hero.primaryBtnText}
                  onChange={(e) => updateHomepageConfig({
                    hero: { ...homepageConfig.hero, primaryBtnText: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none"
                  placeholder="বাটন টেক্সট"
                />
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-950">
                    <input
                      type="radio"
                      name="primaryAction"
                      checked={homepageConfig.hero.primaryBtnAction === 'user_login'}
                      onChange={() => updateHomepageConfig({
                        hero: { ...homepageConfig.hero, primaryBtnAction: 'user_login' }
                      })}
                      className="accent-emerald-600"
                    />
                    ইউজার পোর্টাল ওপেন
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-emerald-950">
                    <input
                      type="radio"
                      name="primaryAction"
                      checked={homepageConfig.hero.primaryBtnAction === 'admin_login'}
                      onChange={() => updateHomepageConfig({
                        hero: { ...homepageConfig.hero, primaryBtnAction: 'admin_login' }
                      })}
                      className="accent-emerald-600"
                    />
                    অ্যাডমিন পোর্টাল ওপেন
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
                <span className="font-bold text-xs text-indigo-900 block">২য় অ্যাকশন বাটন (Secondary CTA):</span>
                <input
                  type="text"
                  value={homepageConfig.hero.secondaryBtnText}
                  onChange={(e) => updateHomepageConfig({
                    hero: { ...homepageConfig.hero, secondaryBtnText: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold focus:border-indigo-500 outline-none"
                  placeholder="বাটন টেক্সট"
                />
                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-indigo-950">
                    <input
                      type="radio"
                      name="secondaryAction"
                      checked={homepageConfig.hero.secondaryBtnAction === 'admin_login'}
                      onChange={() => updateHomepageConfig({
                        hero: { ...homepageConfig.hero, secondaryBtnAction: 'admin_login' }
                      })}
                      className="accent-indigo-600"
                    />
                    অ্যাডমিন পোর্টাল ওপেন
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-indigo-950">
                    <input
                      type="radio"
                      name="secondaryAction"
                      checked={homepageConfig.hero.secondaryBtnAction === 'user_login'}
                      onChange={() => updateHomepageConfig({
                        hero: { ...homepageConfig.hero, secondaryBtnAction: 'user_login' }
                      })}
                      className="accent-indigo-600"
                    />
                    ইউজার পোর্টাল ওপেন
                  </label>
                </div>
              </div>
            </div>

            {/* Highlights List */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">হিরো হাইলাইটস ও ফিচার ব্যাজ:</label>
                <button
                  onClick={addHeroHighlight}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> নতুন হাইলাইট যোগ করুন
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {homepageConfig.hero.highlights.map((hl, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-2 rounded-xl">
                    <input
                      type="text"
                      value={hl}
                      onChange={(e) => updateHeroHighlight(idx, e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
                    />
                    <button
                      onClick={() => deleteHeroHighlight(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PORTALS SECTION */}
      {activeSubSection === 'portals' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                সিস্টেম পোর্টাল কার্ডস কন্ট্রোল (Portals Architecture)
              </h3>
              <p className="text-xs text-slate-500">ইউজার পোর্টাল ও অ্যাডমিন পোর্টাল কার্ডের টাইটেল ও ফিচার তালিকা</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={homepageConfig.portals.showPortals}
                onChange={(e) => updateHomepageConfig({
                  portals: { ...homepageConfig.portals, showPortals: e.target.checked }
                })}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <span>পোর্টাল সেকশন প্রদর্শন করুন</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">সেকশন টাইটেল (Title):</label>
              <input
                type="text"
                value={homepageConfig.portals.sectionTitle}
                onChange={(e) => updateHomepageConfig({
                  portals: { ...homepageConfig.portals, sectionTitle: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">সেকশন সাবটাইটেল (Subtitle):</label>
              <input
                type="text"
                value={homepageConfig.portals.sectionSubtitle}
                onChange={(e) => updateHomepageConfig({
                  portals: { ...homepageConfig.portals, sectionSubtitle: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
              />
            </div>
          </div>

          {/* Both Portal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* User Portal Card Config */}
            <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" /> ইউজার পোর্টাল কার্ড
                </span>
                <label className="flex items-center gap-2 text-xs font-bold text-emerald-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homepageConfig.portals.showUserPortalCard}
                    onChange={(e) => updateHomepageConfig({
                      portals: { ...homepageConfig.portals, showUserPortalCard: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                  />
                  <span>সক্রিয়</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">কার্ড টাইটেল:</label>
                <input
                  type="text"
                  value={homepageConfig.portals.userPortalTitle}
                  onChange={(e) => updateHomepageConfig({
                    portals: { ...homepageConfig.portals, userPortalTitle: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs font-bold text-emerald-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-900 mb-1">কার্ড বিবরণ:</label>
                <textarea
                  rows={2}
                  value={homepageConfig.portals.userPortalDesc}
                  onChange={(e) => updateHomepageConfig({
                    portals: { ...homepageConfig.portals, userPortalDesc: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-white text-xs text-emerald-950"
                />
              </div>
            </div>

            {/* Admin Portal Card Config */}
            <div className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-indigo-600" /> অ্যাডমিন পোর্টাল কার্ড
                </span>
                <label className="flex items-center gap-2 text-xs font-bold text-indigo-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homepageConfig.portals.showAdminPortalCard}
                    onChange={(e) => updateHomepageConfig({
                      portals: { ...homepageConfig.portals, showAdminPortalCard: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                  />
                  <span>সক্রিয়</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-900 mb-1">কার্ড টাইটেল:</label>
                <input
                  type="text"
                  value={homepageConfig.portals.adminPortalTitle}
                  onChange={(e) => updateHomepageConfig({
                    portals: { ...homepageConfig.portals, adminPortalTitle: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs font-bold text-indigo-950"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-900 mb-1">কার্ড বিবরণ:</label>
                <textarea
                  rows={2}
                  value={homepageConfig.portals.adminPortalDesc}
                  onChange={(e) => updateHomepageConfig({
                    portals: { ...homepageConfig.portals, adminPortalDesc: e.target.value }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 bg-white text-xs text-indigo-950"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ABOUT US */}
      {activeSubSection === 'about' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                আমাদের প্রযুক্তি পরিচিতি (About Us Section)
              </h3>
              <p className="text-xs text-slate-500">কোম্পানি স্টোরি, ক্লাউড আর্কিটেকচার ও লাইভ স্ট্যাটাস ম্যাট্রিক্স</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={homepageConfig.about.showAbout}
                onChange={(e) => updateHomepageConfig({
                  about: { ...homepageConfig.about, showAbout: e.target.checked }
                })}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <span>অ্যাবাউট সেকশন সক্রিয়</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">হেডলাইন (Headline):</label>
              <input
                type="text"
                value={homepageConfig.about.headline}
                onChange={(e) => updateHomepageConfig({
                  about: { ...homepageConfig.about, headline: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">মূল বিবরণ (Story Description):</label>
              <textarea
                rows={3}
                value={homepageConfig.about.description}
                onChange={(e) => updateHomepageConfig({
                  about: { ...homepageConfig.about, description: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs md:text-sm font-medium leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800">ম্যাট্রিক ১ (Stat Metric 1):</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={homepageConfig.about.stat1Number}
                    onChange={(e) => updateHomepageConfig({
                      about: { ...homepageConfig.about, stat1Number: e.target.value }
                    })}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-black text-sm text-indigo-600"
                    placeholder="১০০%"
                  />
                  <input
                    type="text"
                    value={homepageConfig.about.stat1Label}
                    onChange={(e) => updateHomepageConfig({
                      about: { ...homepageConfig.about, stat1Label: e.target.value }
                    })}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-800"
                    placeholder="লেবেল"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800">ম্যাট্রিক ২ (Stat Metric 2):</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={homepageConfig.about.stat2Number}
                    onChange={(e) => updateHomepageConfig({
                      about: { ...homepageConfig.about, stat2Number: e.target.value }
                    })}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-black text-sm text-emerald-600"
                    placeholder="৮+ রোল"
                  />
                  <input
                    type="text"
                    value={homepageConfig.about.stat2Label}
                    onChange={(e) => updateHomepageConfig({
                      about: { ...homepageConfig.about, stat2Label: e.target.value }
                    })}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-800"
                    placeholder="লেবেল"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">সিস্টেম হেলথ টেক্সট:</label>
              <input
                type="text"
                value={homepageConfig.about.systemHealthText}
                onChange={(e) => updateHomepageConfig({
                  about: { ...homepageConfig.about, systemHealthText: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-emerald-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: FEATURES LIST */}
      {activeSubSection === 'features' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                ফিচারস ও সার্ভিস বক্স লিস্ট বিল্ডার
              </h3>
              <p className="text-xs text-slate-500">হোমপেজে প্রদর্শিত কার্ডসমূহের আইকন, শিরোনাম ও বিবরণ তৈরি করুন</p>
            </div>
            <button
              onClick={addFeatureItem}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> নতুন ফিচার বক্স যোগ করুন
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">সেকশন শিরোনাম:</label>
              <input
                type="text"
                value={homepageConfig.features.headline}
                onChange={(e) => updateHomepageConfig({
                  features: { ...homepageConfig.features, headline: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">সেকশন সাবটাইটেল:</label>
              <input
                type="text"
                value={homepageConfig.features.subtitle}
                onChange={(e) => updateHomepageConfig({
                  features: { ...homepageConfig.features, subtitle: e.target.value }
                })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
              />
            </div>
          </div>

          {/* Cards list */}
          <div className="space-y-4 pt-2">
            {homepageConfig.features.items.map((item, idx) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-400 font-mono">
                    বক্স #{idx + 1}
                  </span>
                  <button
                    onClick={() => deleteFeatureItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">আইকন (Icon):</label>
                    <select
                      value={item.icon}
                      onChange={(e) => updateFeatureItem(item.id, { icon: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800"
                    >
                      {AVAILABLE_ICONS.map(ic => (
                        <option key={ic} value={ic}>{ic}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">শিরোনাম (Title):</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateFeatureItem(item.id, { title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">বিস্তারিত বিবরণ (Description):</label>
                  <textarea
                    rows={2}
                    value={item.description}
                    onChange={(e) => updateFeatureItem(item.id, { description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CONTACT & SUPPORT */}
      {activeSubSection === 'contact' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-indigo-600" />
                সাপোর্ট ও যোগাযোগ ইনফো (Contact & Support)
              </h3>
              <p className="text-xs text-slate-500">অফিস ঠিকানা, হেল্পলাইন নাম্বার ও কন্টাক্ট মেসেজ ফর্মের সেটিংস</p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={homepageConfig.contact.showContact}
                onChange={(e) => updateHomepageConfig({
                  contact: { ...homepageConfig.contact, showContact: e.target.checked }
                })}
                className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
              />
              <span>কন্টাক্ট সেকশন সক্রিয়</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">সাপোর্ট ইমেইল (Email):</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Mail className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="email"
                  value={homepageConfig.contact.email}
                  onChange={(e) => updateHomepageConfig({
                    contact: { ...homepageConfig.contact, email: e.target.value }
                  })}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">হেল্পলাইন ফোন (Phone):</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Phone className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  value={homepageConfig.contact.phone}
                  onChange={(e) => updateHomepageConfig({
                    contact: { ...homepageConfig.contact, phone: e.target.value }
                  })}
                  className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">অফিসের ঠিকানা (Address):</label>
            <div className="flex items-start bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 mt-0.5" />
              <input
                type="text"
                value={homepageConfig.contact.address}
                onChange={(e) => updateHomepageConfig({
                  contact: { ...homepageConfig.contact, address: e.target.value }
                })}
                className="w-full bg-transparent text-xs font-bold text-slate-800 outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: FOOTER */}
      {activeSubSection === 'footer' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              ফুটার ব্র্যান্ডিং ও কপিরাইট (Footer Settings)
            </h3>
            <p className="text-xs text-slate-500">হোমপেজের ফুটারে প্রদর্শিত কোম্পানির পরিচিতি ও কপিরাইট নোটিশ</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ফুটার ব্র্যান্ড নাম:</label>
              <input
                type="text"
                value={homepageConfig.footer.brandTitle}
                onChange={(e) => updateHomepageConfig({
                  footer: { ...homepageConfig.footer, brandTitle: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ফুটার সংক্ষিপ্ত বিবরণ:</label>
              <textarea
                rows={2}
                value={homepageConfig.footer.brandDesc}
                onChange={(e) => updateHomepageConfig({
                  footer: { ...homepageConfig.footer, brandDesc: e.target.value }
                })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">কপিরাইট টেক্সট:</label>
                <input
                  type="text"
                  value={homepageConfig.footer.copyrightText}
                  onChange={(e) => updateHomepageConfig({
                    footer: { ...homepageConfig.footer, copyrightText: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">সিস্টেম স্ট্যাটাস টেক্সট:</label>
                <input
                  type="text"
                  value={homepageConfig.footer.statusText}
                  onChange={(e) => updateHomepageConfig({
                    footer: { ...homepageConfig.footer, statusText: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Toast */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-[90] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 font-bold text-xs animate-in slide-in-from-top-4 duration-150">
          <CheckCircle2 className="w-4 h-4" />
          <span>হোমপেজ ও হেডার সেটিংস সফলভাবে সেভ হয়েছে!</span>
        </div>
      )}
    </div>
  );
}
