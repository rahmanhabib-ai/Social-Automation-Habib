import React from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { 
  Sparkles, 
  Type, 
  Palette, 
  MousePointerClick, 
  Layout, 
  Globe2, 
  Eye, 
  Image as ImageIcon,
  Check,
  RotateCcw
} from 'lucide-react';
import * as Icons from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Royal Blue', hex: '#2563eb' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Indigo Purple', hex: '#6366f1' },
  { name: 'Violet Glow', hex: '#8b5cf6' },
  { name: 'Rose Red', hex: '#f43f5e' },
  { name: 'Amber Gold', hex: '#f59e0b' },
  { name: 'Cyan Tech', hex: '#06b6d4' },
  { name: 'Slate Dark', hex: '#0f172a' },
];

const FONT_OPTIONS = [
  { id: 'font-sans', name: 'Plus Jakarta Sans / Inter (Modern Sans)' },
  { id: 'font-serif', name: 'Hind Siliguri / Bengali Serif (বাংলা ফ্রেন্ডলি)' },
  { id: 'font-mono', name: 'Fira Code / JetBrains Mono (Tech/Dev)' },
];

const ICON_LIST = [
  // Retail, Shop & Store
  { id: 'Store', label: 'Store (দোকান)', category: 'shop' },
  { id: 'ShoppingBag', label: 'Shopping Bag (শপিং ব্যাগ)', category: 'shop' },
  { id: 'ShoppingCart', label: 'Shopping Cart (কার্ট)', category: 'shop' },
  { id: 'Shop', label: 'Shop (শপ)', category: 'shop', fallback: 'Store' },
  
  // Pharmacy & Medical / Health
  { id: 'Pill', label: 'Pill (ফার্মেসি / ওষুধ)', category: 'pharmacy' },
  { id: 'Stethoscope', label: 'Stethoscope (ডাক্তার / স্বাস্থ্য)', category: 'pharmacy' },
  { id: 'Cross', label: 'Medical Cross (হাসপাতাল)', category: 'pharmacy' },
  { id: 'HeartPulse', label: 'Heart Pulse (ক্লিনিক)', category: 'pharmacy' },
  { id: 'Activity', label: 'Activity (স্বাস্থ্য সেবা)', category: 'pharmacy' },

  // Restaurant, Food & Dining
  { id: 'Utensils', label: 'Utensils (রেস্টুরেন্ট)', category: 'food' },
  { id: 'Coffee', label: 'Coffee (ক্যাফে)', category: 'food' },
  { id: 'UtensilsCrossed', label: 'Dining (খাবার ও ডাইনিং)', category: 'food' },
  { id: 'Soup', label: 'Soup (হোটেল ও ফুড)', category: 'food' },
  { id: 'Pizza', label: 'Fast Food (ফাস্ট ফুড)', category: 'food' },

  // Business Growth & Analytics
  { id: 'TrendingUp', label: 'Trending Up (গ্রোথ বিজনেস)', category: 'growth' },
  { id: 'LineChart', label: 'Line Chart (গ্রোথ এনালাইসিস)', category: 'growth' },
  { id: 'BarChart3', label: 'Bar Chart (ব্যবসা মেট্রিক্স)', category: 'growth' },
  { id: 'Rocket', label: 'Rocket (বিজনেস লঞ্চ / গ্রোথ)', category: 'growth' },
  { id: 'Target', label: 'Target (টার্গেট ও সেলস)', category: 'growth' },

  // General Enterprise & Tech
  { id: 'LayoutDashboard', label: 'Dashboard (ড্যাশবোর্ড)', category: 'general' },
  { id: 'Building2', label: 'Enterprise (কর্পোরেট)', category: 'general' },
  { id: 'Package', label: 'Inventory (ইনভেন্টরি)', category: 'general' },
  { id: 'Boxes', label: 'Warehouse (গুদাম)', category: 'general' },
  { id: 'Truck', label: 'Logistics (ডেলিভারি)', category: 'general' },
  { id: 'CreditCard', label: 'Payment (পেমেন্ট)', category: 'general' },
  { id: 'Wallet', label: 'Wallet (হিসাব)', category: 'general' },
  { id: 'Flame', label: 'Popular (হট অফার)', category: 'general' },
  { id: 'Sparkles', label: 'AI Magic (ম্যাজিক)', category: 'general' },
  { id: 'Globe', label: 'Global (অনলাইন)', category: 'general' },
  { id: 'ShieldCheck', label: 'Security (নিরাপত্তা)', category: 'general' },
  { id: 'Zap', label: 'Lightning (দ্রুত গতি)', category: 'general' }
];

export default function BrandThemeTab() {
  const { brandConfig, updateBrandConfig } = useSidebar();

  const SelectedHomeIcon = (Icons as any)[brandConfig.homePageIcon] || Icons.LayoutDashboard;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <Palette className="w-3.5 h-3.5" /> ব্র্যান্ড, থিম ও UI ইঞ্জিন
          </div>
          <h2 className="text-2xl font-black tracking-tight">সাইট পরিচিতি ও গ্লোবাল ভিজ্যুয়াল কন্ট্রোলার</h2>
          <p className="text-blue-100 text-sm mt-1">
            কোড এডিট না করেই আপনার পুরো ওয়েবসাইটের নাম, লোগো, ফন্ট, কালার প্যালেট ও বাটন ডিজাইন কাস্টমাইজ করুন।
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => updateBrandConfig({
              siteNameEn: 'SmartPOS & Automation',
              siteNameBn: 'স্মার্ট পিওএস ও অটোমেশন',
              primaryColor: '#2563eb',
              borderRadius: '14px',
              surfaceTheme: 'light'
            })}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm"
          >
            <RotateCcw className="w-4 h-4" /> রিসেট থিম
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Columns: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Brand Identity */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">১. ব্র্যান্ড পরিচিতি ও নাম (Brand Identity)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  সাইটের নাম (English)
                </label>
                <input
                  type="text"
                  value={brandConfig.siteNameEn}
                  onChange={(e) => updateBrandConfig({ siteNameEn: e.target.value })}
                  placeholder="e.g. SmartPOS & Automation"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  সাইটের নাম (বাংলা)
                </label>
                <input
                  type="text"
                  value={brandConfig.siteNameBn}
                  onChange={(e) => updateBrandConfig({ siteNameBn: e.target.value })}
                  placeholder="যেমন: স্মার্ট পিওএস ও অটোমেশন"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ট্যাগলাইন (English Slogan)
                </label>
                <input
                  type="text"
                  value={brandConfig.taglineEn}
                  onChange={(e) => updateBrandConfig({ taglineEn: e.target.value })}
                  placeholder="Unified Enterprise Platform"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 outline-none bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ট্যাগলাইন (বাংলা স্লোগান)
                </label>
                <input
                  type="text"
                  value={brandConfig.taglineBn}
                  onChange={(e) => updateBrandConfig({ taglineBn: e.target.value })}
                  placeholder="সমন্বিত এন্টারপ্রাইজ অপারেশন"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 outline-none bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  লোগো URL (Primary Logo)
                </label>
                <input
                  type="text"
                  value={brandConfig.logoUrl}
                  onChange={(e) => updateBrandConfig({ logoUrl: e.target.value })}
                  placeholder="https://.../logo.png"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-blue-500 outline-none bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-400 mt-1">ফাঁকা রাখলে নিচে সিলেক্টেড ব্র্যান্ড আইকন কাজ করবে</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ডার্ক মোড লোগো URL
                </label>
                <input
                  type="text"
                  value={brandConfig.darkLogoUrl}
                  onChange={(e) => updateBrandConfig({ darkLogoUrl: e.target.value })}
                  placeholder="https://.../dark-logo.png"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-blue-500 outline-none bg-slate-50/50"
                />
                <p className="text-[10px] text-slate-400 mt-1">ডার্ক মোডে স্বয়ংক্রিয় অ্যাডাপ্ট হবে</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ফ্যাভিকন (Favicon URL)
                </label>
                <input
                  type="text"
                  value={brandConfig.faviconUrl}
                  onChange={(e) => updateBrandConfig({ faviconUrl: e.target.value })}
                  placeholder="https://.../favicon.ico"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:border-blue-500 outline-none bg-slate-50/50"
                />
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">ফাঁকা রাখলে লাইভ SVG ফ্যাভিকন স্বয়ংক্রিয় তৈরি হবে</p>
              </div>
            </div>

            {/* Home Icon & Badge */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    হোমপেজ ও ব্র্যান্ড আইকন (Icon Selector)
                  </label>
                  <span className="text-[10px] font-semibold text-slate-500">
                    সিলেক্টেড: <strong className="text-blue-600 font-mono">{brandConfig.homePageIcon}</strong>
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  {/* Categorized Quick Filters & Icons */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1">
                    {ICON_LIST.map(item => {
                      const IconComp = (Icons as any)[item.id] || (Icons as any)[item.fallback || 'Store'] || Icons.LayoutDashboard;
                      const isSelected = brandConfig.homePageIcon === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => updateBrandConfig({ homePageIcon: item.id })}
                          className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-500/30' 
                              : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                          }`}
                          title={item.label}
                        >
                          <IconComp className="w-5 h-5" />
                          <span className="text-[9px] font-bold truncate max-w-full text-center">
                            {item.id}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  হেডার ব্যাজ টেক্সট (Badge)
                </label>
                <input
                  type="text"
                  value={brandConfig.homePageBadge}
                  onChange={(e) => updateBrandConfig({ homePageBadge: e.target.value })}
                  placeholder="e.g. v2.5 Enterprise"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 outline-none bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Global Color & Theme Matrix */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Palette className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">২. থিম ও কালার ম্যাট্রিক্স (Theme & Colors)</h3>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                প্রাইমারি ব্র্যান্ড কালার (Primary Brand Color)
              </label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => updateBrandConfig({ primaryColor: c.hex })}
                    className={`h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer border-2 ${
                      brandConfig.primaryColor === c.hex ? 'border-slate-900 scale-105 shadow-md' : 'border-transparent hover:scale-95'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {brandConfig.primaryColor === c.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>

              {/* Custom Hex */}
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="color"
                  value={brandConfig.primaryColor}
                  onChange={(e) => updateBrandConfig({ primaryColor: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-slate-200 cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={brandConfig.primaryColor}
                  onChange={(e) => updateBrandConfig({ primaryColor: e.target.value })}
                  placeholder="#2563eb"
                  className="w-32 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase bg-slate-50 focus:border-indigo-500 outline-none"
                />
                <span className="text-xs text-slate-500 font-medium">কাস্টম হেক্স কোড লিখুন বা কালার পিকার ব্যবহার করুন</span>
              </div>
            </div>

            {/* Surface Theme */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  সারফেস থিম (Surface Theme)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'light', label: 'Classic Light', bg: 'bg-white text-slate-800' },
                    { id: 'slate', label: 'Modern Slate', bg: 'bg-slate-900 text-white' },
                    { id: 'dark', label: 'Pure Dark', bg: 'bg-black text-white' },
                    { id: 'warm', label: 'Warm Neutral', bg: 'bg-amber-50/70 text-amber-950' }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => updateBrandConfig({ surfaceTheme: theme.id as any })}
                      className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        brandConfig.surfaceTheme === theme.id 
                          ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300'
                      } ${theme.bg}`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  সাইডবার ভিউ মোড (Sidebar Mode)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fixed', label: 'Fixed Full' },
                    { id: 'mini', label: 'Mini Icons' },
                    { id: 'floating', label: 'Floating' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => updateBrandConfig({ sidebarMode: mode.id as any })}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        brandConfig.sidebarMode === mode.id 
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Typography & Fonts */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Type className="w-5 h-5 text-violet-600" />
              <h3 className="font-bold text-slate-900 text-base">৩. টাইপোগ্রাফি ও ফন্ট ইঞ্জিন (Typography & Headings)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  H1-H6 হেডিং ফন্ট (Heading Font)
                </label>
                <select
                  value={brandConfig.h1Font}
                  onChange={(e) => updateBrandConfig({ h1Font: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-violet-500 outline-none bg-slate-50"
                >
                  {FONT_OPTIONS.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  হেডিং ফন্ট ওয়েট (Heading Font Weight)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '500', label: 'Medium 500' },
                    { id: '700', label: 'Bold 700' },
                    { id: '800', label: 'Black 800' }
                  ].map(w => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => updateBrandConfig({ fontWeight: w.id as any })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        brandConfig.fontWeight === w.id 
                          ? 'border-violet-600 bg-violet-50 text-violet-700 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Button & Component Styles */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MousePointerClick className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">৪. বাটন ও কম্পোনেন্ট স্টাইল (Buttons & Components)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  বর্ডার রাউন্ডনেস (Border Radius)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: '0px', label: 'Square (0px)' },
                    { id: '8px', label: 'Soft (8px)' },
                    { id: '14px', label: 'Modern (14px)' },
                    { id: '9999px', label: 'Full Pill' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => updateBrandConfig({ borderRadius: r.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        brandConfig.borderRadius === r.id 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  বাটন শ্যাডো ও এলিভেশন (Shadow)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Flat (None)' },
                    { id: 'soft', label: 'Soft Shadow' },
                    { id: 'glow', label: 'Ambient Glow' }
                  ].map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => updateBrandConfig({ buttonShadow: s.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        brandConfig.buttonShadow === s.id 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Localization Defaults */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Globe2 className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">৫. ডিফল্ট লোকালাইজেশন ও কারেন্সি (System Defaults)</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  ডিফল্ট ভাষা (Default Language)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'bn', label: 'বাংলা' },
                    { id: 'en', label: 'English' }
                  ].map(l => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => updateBrandConfig({ defaultLanguage: l.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        brandConfig.defaultLanguage === l.id 
                          ? 'border-amber-600 bg-amber-50 text-amber-800 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  কারেন্সি (Currency)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'BDT', label: '৳ BDT (টাকা)' },
                    { id: 'USD', label: '$ USD (ডলার)' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => updateBrandConfig({ currency: c.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        brandConfig.currency === c.id 
                          ? 'border-amber-600 bg-amber-50 text-amber-800 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  টাইম ফরম্যাট (Time Format)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '12h', label: '12-Hour (AM/PM)' },
                    { id: '24h', label: '24-Hour (Military)' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => updateBrandConfig({ timeFormat: t.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        brandConfig.timeFormat === t.id 
                          ? 'border-amber-600 bg-amber-50 text-amber-800 shadow-sm' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Live Interactive Preview Sandbox */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Sandbox Top Bar */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">লাইভ প্রিভিউ স্যান্ডবক্স (Live Preview)</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                  Real-time
                </span>
              </div>

              {/* Simulated UI Window */}
              <div className={`p-6 space-y-6 ${brandConfig.surfaceTheme === 'slate' ? 'bg-slate-950 text-white' : brandConfig.surfaceTheme === 'dark' ? 'bg-black text-white' : brandConfig.surfaceTheme === 'warm' ? 'bg-amber-50/50 text-slate-900' : 'bg-slate-50 text-slate-900'}`}>
                
                {/* Simulated Header */}
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 flex items-center justify-center text-white shadow-md"
                      style={{ 
                        backgroundColor: brandConfig.primaryColor,
                        borderRadius: brandConfig.borderRadius 
                      }}
                    >
                      <SelectedHomeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-2">
                        {brandConfig.siteNameEn || 'SmartPOS'}
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 text-white"
                          style={{ 
                            backgroundColor: brandConfig.primaryColor,
                            borderRadius: brandConfig.borderRadius === '9999px' ? '9999px' : '6px' 
                          }}
                        >
                          {brandConfig.homePageBadge || 'Live'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">{brandConfig.siteNameBn}</div>
                    </div>
                  </div>
                </div>

                {/* Simulated Main Heading */}
                <div className="space-y-2">
                  <div className={`text-xs uppercase tracking-wider font-bold text-slate-400`}>
                    {brandConfig.taglineEn || 'Enterprise Operations Hub'}
                  </div>
                  <h1 
                    className={`text-2xl font-black tracking-tight leading-tight text-slate-900 ${brandConfig.h1Font}`}
                    style={{ fontWeight: Number(brandConfig.fontWeight) || 700 }}
                  >
                    স্বাগতম {brandConfig.siteNameBn}!
                  </h1>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {brandConfig.taglineBn || 'আপনার বিজনেসের প্রতিটি অপারেশন এখন এআই ও অটোমেশনের মাধ্যমে পরিচালিত হবে।'}
                  </p>
                </div>

                {/* Simulated Interactive Buttons */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">বাটন প্রিভিউ (Button Variations):</div>
                  <div className="flex flex-wrap gap-2">
                    {/* Primary Button */}
                    <button
                      type="button"
                      className={`px-5 py-2.5 text-xs font-bold text-white flex items-center gap-2 cursor-pointer transition-transform ${
                        brandConfig.buttonHoverEffect === 'scale' ? 'hover:scale-105 active:scale-95' : ''
                      }`}
                      style={{
                        backgroundColor: brandConfig.primaryColor,
                        borderRadius: brandConfig.borderRadius,
                        boxShadow: brandConfig.buttonShadow === 'glow' ? `0 0 20px ${brandConfig.primaryColor}55` : brandConfig.buttonShadow === 'soft' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <SelectedHomeIcon className="w-4 h-4" /> প্রাইমারি অ্যাকশন
                    </button>

                    {/* Secondary Button */}
                    <button
                      type="button"
                      className="px-5 py-2.5 text-xs font-bold bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 shadow-sm cursor-pointer"
                      style={{ borderRadius: brandConfig.borderRadius }}
                    >
                      সেকেন্ডারি বাটন
                    </button>
                  </div>
                </div>

                {/* Info Card */}
                <div 
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-2"
                  style={{ borderRadius: brandConfig.borderRadius }}
                >
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>সিস্টেম কনফিগারেশন সারসংক্ষেপ</span>
                    <span className="text-emerald-600 font-mono text-[11px]">Active</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-1">
                    <div>• মুদ্রা: <strong className="font-mono">{brandConfig.currency} (টাকা)</strong></div>
                    <div>• ডিফল্ট ভাষা: <strong>{brandConfig.defaultLanguage === 'bn' ? 'বাংলা' : 'English'}</strong></div>
                    <div>• সময় ফরম্যাট: <strong className="font-mono">{brandConfig.timeFormat}</strong></div>
                    <div>• অ্যাকসেন্ট কালার কোড: <strong className="font-mono text-blue-600">{brandConfig.primaryColor}</strong></div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
