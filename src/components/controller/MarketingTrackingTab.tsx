import React, { useState } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { copyToClipboard } from '../../utils/clipboard';
import { getPublicLiveOrigin, CANONICAL_PUBLIC_LIVE_URL } from '../../utils/publicUrl';
import { 
  BarChart3, 
  Code2, 
  Share2, 
  Target, 
  CheckCircle2, 
  Sparkles,
  Terminal,
  Activity,
  Search,
  Globe,
  FileCode,
  Check,
  HelpCircle,
  ExternalLink,
  Layers,
  Copy,
  FileText
} from 'lucide-react';

export default function MarketingTrackingTab() {
  const { marketingConfig, updateMarketingConfig, brandConfig } = useSidebar();
  const [activeSubTab, setActiveSubTab] = useState<'seo' | 'pixels' | 'custom_code'>('seo');
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);

  // Compute live standalone clean origin & sitemap URL (Always resolving to public universal URL)
  const currentOrigin = getPublicLiveOrigin();
  const currentSitemapUrl = `${currentOrigin}${marketingConfig.sitemapXmlUrl || '/sitemap.xml'}`;

  const handleCopySitemap = async () => {
    const success = await copyToClipboard(currentSitemapUrl);
    if (success) {
      setCopiedSitemap(true);
      setTimeout(() => setCopiedSitemap(false), 2200);
    }
  };

  const handleCopyCleanAppUrl = async () => {
    const success = await copyToClipboard(currentOrigin);
    if (success) {
      setCopiedAppUrl(true);
      setTimeout(() => setCopiedAppUrl(false), 2200);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <Search className="w-3.5 h-3.5" /> গুগল SEO র‍্যাংকিং, মার্কেটিং ও পিক্সেল হাব
          </div>
          <h2 className="text-2xl font-black tracking-tight">Google SEO Master, Pixels & Tag Manager</h2>
          <p className="text-indigo-100 text-sm mt-1">
            গুগল সার্চে দ্রুত র‍্যাংকিংয়ের জন্য টার্গেট কীওয়ার্ড, মেটা টাইটেল, ডেসক্রিপশন, Google Search Console ভেরিফিকেশন, Schema ও পিক্সেল কনফিগার করুন।
          </p>
        </div>

        {/* Sub Navigation Pills */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl backdrop-blur-md self-start md:self-center shrink-0 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveSubTab('seo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'seo' ? 'bg-white text-indigo-900 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" /> গুগল SEO ও র‍্যাংকিং
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('pixels')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'pixels' ? 'bg-white text-indigo-900 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> পিক্সেল ও ট্র্যাকিং
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('custom_code')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'custom_code' ? 'bg-white text-indigo-900 shadow-sm' : 'text-white/80 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" /> স্ক্রিপ্ট ইনজেকশন
          </button>
        </div>
      </div>

      {activeSubTab === 'seo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 7 Columns: SEO Configuration Inputs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Google SEO Target Keywords & Primary Language */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">১. টার্গেট কীওয়ার্ড ও ইংলিশ ল্যাঙ্গুয়েজ অপটিমাইজেশন (SEO Keywords)</h3>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                  Google First Choice: English
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    টার্গেট কীওয়ার্ডস (English Target Keywords) — <span className="text-blue-600 font-semibold lowercase">কমা দিয়ে আলাদা করুন</span>
                  </label>
                  <textarea
                    rows={3}
                    value={marketingConfig.seoTargetKeywordsEn}
                    onChange={(e) => updateMarketingConfig({ seoTargetKeywordsEn: e.target.value })}
                    placeholder="Smart POS system, cloud billing software, pharmacy management pos, restaurant ordering system, best pos in bangladesh, whatsapp order bot"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:border-blue-500 focus:bg-white outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    গুগলে ব্যবহারকারীরা যেসব ইংলিশ শব্দ দিয়ে আপনার বিজনেস খুঁজবে সেগুলো এখানে দিন (যেমন: Pharmacy POS, Cloud Billing, Retail ERP)।
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    টার্গেট কীওয়ার্ডস (বাংলা কীওয়ার্ডসমূহ)
                  </label>
                  <textarea
                    rows={2}
                    value={marketingConfig.seoTargetKeywordsBn}
                    onChange={(e) => updateMarketingConfig({ seoTargetKeywordsBn: e.target.value })}
                    placeholder="স্মার্ট পিওএস সফটওয়্যার, ফার্মেসি বিলিং সফটওয়্যার, রেস্টুরেন্ট ম্যানেজমেন্ট, ইনভেন্টরি সফটওয়্যার, অনলাইন অর্ডার"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:border-blue-500 focus:bg-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Google Search Result Snippet (Meta Title & Meta Description) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">২. গুগল সার্চ রেজাল্ট মেটা ট্যাগ (Title & Description)</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      গুগল সার্চ এসইও টাইটেল (English Primary Title)
                    </label>
                    <span className={`text-[10px] font-mono font-bold ${marketingConfig.seoTitleEn?.length > 60 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {marketingConfig.seoTitleEn?.length || 0} / 60 chars (Best: 50-60)
                    </span>
                  </div>
                  <input
                    type="text"
                    value={marketingConfig.seoTitleEn}
                    onChange={(e) => updateMarketingConfig({ seoTitleEn: e.target.value })}
                    placeholder="SmartPOS & Automation — Modern Cloud POS & Enterprise Platform"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:border-blue-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      গুগল সার্চ মেটা ডেসক্রিপশন (English Meta Description)
                    </label>
                    <span className={`text-[10px] font-mono font-bold ${marketingConfig.seoMetaDescriptionEn?.length > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {marketingConfig.seoMetaDescriptionEn?.length || 0} / 160 chars (Best: 140-160)
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={marketingConfig.seoMetaDescriptionEn}
                    onChange={(e) => updateMarketingConfig({ seoMetaDescriptionEn: e.target.value })}
                    placeholder="All-in-one cloud POS, inventory, pharmacy & restaurant management platform. Scale your business with AI and real-time WhatsApp automation."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:border-blue-500 focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      রোবটস ইনডেক্সিং পলিসি (Robots Directive)
                    </label>
                    <select
                      value={marketingConfig.seoRobotsDirective}
                      onChange={(e) => updateMarketingConfig({ seoRobotsDirective: e.target.value as any })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:border-blue-500 outline-none cursor-pointer"
                    >
                      <option value="index, follow">index, follow (গুগলে ইনডেক্স হবে - রিকমেন্ডেড)</option>
                      <option value="noindex, follow">noindex, follow (সার্চে লুকানো কিন্তু লিংক ফলো)</option>
                      <option value="index, nofollow">index, nofollow (ইনডেক্স হবে লিংক ব্লক)</option>
                      <option value="noindex, nofollow">noindex, nofollow (সম্পূর্ণ প্রাইভেট)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      ক্যানোনিকাল URL (Canonical URL)
                    </label>
                    <input
                      type="text"
                      value={marketingConfig.seoCanonicalUrl}
                      onChange={(e) => updateMarketingConfig({ seoCanonicalUrl: e.target.value })}
                      placeholder="https://yourbrand.com (ফাঁকা রাখলে স্বয়ংক্রিয় অরিজিন)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Google Search Console Verification & Sitemap */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-base">৩. গুগল সার্চ কনসোল ও সাইটম্যাপ (Search Console & Sitemap)</h3>
                </div>
              </div>

              <div className="space-y-4">
                {/* Google Site Verification Tag */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Google Site Verification Tag / HTML Tag
                  </label>
                  <input
                    type="text"
                    value={marketingConfig.googleSiteVerificationTag}
                    onChange={(e) => updateMarketingConfig({ googleSiteVerificationTag: e.target.value })}
                    placeholder="google-site-verification=abc1234567890xyz"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:border-blue-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Google Search Console &gt; Settings &gt; Ownership Verification &gt; HTML Tag মেথড থেকে টোকেনটি পেস্ট করুন।
                  </p>
                </div>

                {/* 1. Clean Live Website URL */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      লাইভ ওয়েবসাইটের ক্লিন ইউআরএল (Live Web URL)
                    </span>
                    <p className="font-mono text-xs text-slate-900 font-semibold mt-1.5 break-all select-all">
                      {currentOrigin}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      সার্চ ইঞ্জিনে বা ফেসবুকে শেয়ার করার জন্য আপনার মূল ক্লিন ওয়েবসাইট ঠিকানা।
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyCleanAppUrl}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                    >
                      {copiedAppUrl ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAppUrl ? 'কপি হয়েছে' : 'ক্লিন URL কপি'}</span>
                    </button>
                    <a
                      href={currentOrigin}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
                    >
                      <span>ওপেন</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* 2. Google Sitemap.xml URL */}
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        সাইটম্যাপ URL (Sitemap Link)
                      </span>
                      <a 
                        href={currentSitemapUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[10px] text-indigo-600 hover:underline flex items-center gap-0.5 font-bold"
                      >
                        XML দেখুন <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <p className="font-mono text-xs text-indigo-950 font-semibold mt-1.5 truncate">
                      {currentSitemapUrl}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      গুগল সার্চ কনসোলে (Sitemaps সেকশনে) সাবমিট করার জন্য এই লিংকটি কপি করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopySitemap}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer shrink-0 transition-all active:scale-95"
                  >
                    {copiedSitemap ? <Check className="w-3.5 h-3.5 text-white" /> : <FileText className="w-3.5 h-3.5" />}
                    <span>{copiedSitemap ? 'কপি হয়েছে' : 'সাইটম্যাপ লিংক কপি'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Schema.org Structured Data for Google Rich Snippets */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-base">৪. গুগল রিচ স্নsnippet ও স্কিমা মার্কআপ (JSON-LD Schema)</h3>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marketingConfig.enableStructuredSchema}
                    onChange={(e) => updateMarketingConfig({ enableStructuredSchema: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-700">স্কিমা সক্রিয়</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    ব্যবসার ধরন (Business Schema Type)
                  </label>
                  <select
                    value={marketingConfig.schemaBusinessType}
                    onChange={(e) => updateMarketingConfig({ schemaBusinessType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="SoftwareApplication">Software / SaaS Application</option>
                    <option value="Store">Retail Store (দোকান ও শপ)</option>
                    <option value="Pharmacy">Pharmacy & Medical (ফার্মেসি)</option>
                    <option value="Restaurant">Restaurant & Food (রেস্টুরেন্ট)</option>
                    <option value="LocalBusiness">Local Business (স্থানীয় প্রতিষ্ঠান)</option>
                    <option value="Organization">Corporate Organization (কর্পোরেট)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Author / Publisher Name
                  </label>
                  <input
                    type="text"
                    value={marketingConfig.seoAuthorOrPublisher}
                    onChange={(e) => updateMarketingConfig({ seoAuthorOrPublisher: e.target.value })}
                    placeholder="SmartPOS Enterprise Solutions"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right 5 Columns: Google SERP Live Preview & SEO Health Inspector */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Real-Time Google Search Engine Result Preview */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">গুগল সার্চ লাইভ প্রিভিউ (SERP Simulation)</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  Google Mockup
                </span>
              </div>

              {/* Google Result Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                    G
                  </div>
                  <span className="truncate max-w-[200px] text-slate-700 font-mono text-[11px]">
                    {currentOrigin || 'https://yourwebsite.com'}
                  </span>
                  <span className="text-slate-400">›</span>
                  <span className="text-slate-500 text-[11px]">app</span>
                </div>

                <h4 className="text-base font-semibold text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                  {marketingConfig.seoTitleEn || `${brandConfig.siteNameEn} — ${brandConfig.siteNameBn}`}
                </h4>

                <p className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                  {marketingConfig.seoMetaDescriptionEn || brandConfig.taglineEn || 'Modern enterprise operations, POS billing, inventory management and real-time WhatsApp bot platform.'}
                </p>

                {/* Keyword tags chips */}
                {marketingConfig.seoTargetKeywordsEn && (
                  <div className="pt-2 flex flex-wrap gap-1">
                    {marketingConfig.seoTargetKeywordsEn.split(',').slice(0, 4).map((kw, i) => (
                      <span key={i} className="text-[10px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                        {kw.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SEO Score & Ranking Tips Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>গুগলে ১ম পেজে র‍্যাংক করার টিপস (SEO Ranking Checklist)</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>ইংরেজি ও বাংলা উভয় টাইটেল:</strong> টাইটেলে মূল ব্যবসা ও শহর/দেশ উল্লেখ থাকলে লোকাল সার্চে এগিয়ে থাকে।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>টার্গেট কীওয়ার্ড ডেসক্রিপশন:</strong> প্রথম ৬০ অক্ষরের মধ্যে মূল কীওয়ার্ড ব্যবহার করুন।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>গুগল সার্চ কনসোল:</strong> ভেরিফিকেশন ট্যাগ দিয়ে আপনার ওয়েবসাইট গুগল ইনডেক্সে সাবমিট করুন।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>JSON-LD স্কিমা:</strong> Rich Snippet গুগল রোবটকে ক্যাটাগরি চিনতে ১০০% সাহায্য করে।</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </div>
      )}

      {activeSubTab === 'pixels' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Meta Pixel & CAPI */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">১. মেটা (ফেসবুক) পিক্সেল ও CAPI</h3>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  Server-Side Ready
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Meta Pixel ID (Dataset ID)
                  </label>
                  <input
                    type="text"
                    value={marketingConfig.metaPixelId}
                    onChange={(e) => updateMarketingConfig({ metaPixelId: e.target.value })}
                    placeholder="e.g. 123456789012345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Meta Conversions API (CAPI) Access Token
                  </label>
                  <input
                    type="password"
                    value={marketingConfig.metaCapiToken}
                    onChange={(e) => updateMarketingConfig({ metaCapiToken: e.target.value })}
                    placeholder="EAAG... (Server-side Event Access Token)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Test Event Code (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={marketingConfig.metaTestEventCode}
                    onChange={(e) => updateMarketingConfig({ metaTestEventCode: e.target.value })}
                    placeholder="TEST12345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Google Ecosystem (GTM & GA4) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-base">২. গুগল ইকোসিস্টেম (GTM & Google Analytics 4)</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    GTM Container ID
                  </label>
                  <input
                    type="text"
                    value={marketingConfig.gtmContainerId}
                    onChange={(e) => updateMarketingConfig({ gtmContainerId: e.target.value })}
                    placeholder="GTM-XXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    GA4 Measurement ID
                  </label>
                  <input
                    type="text"
                    value={marketingConfig.ga4MeasurementId}
                    onChange={(e) => updateMarketingConfig({ ga4MeasurementId: e.target.value })}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: TikTok & Clarity */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-slate-900 text-base">৩. টিকটক পিক্সেল ও মাইক্রোসফট ক্ল্যারিটি</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    TikTok Pixel ID
                  </label>
                  <input
                    type="text"
                    value={marketingConfig.tiktokPixelId}
                    onChange={(e) => updateMarketingConfig({ tiktokPixelId: e.target.value })}
                    placeholder="C1234567890ABC"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Microsoft Clarity Project ID
                  </label>
                  <input
                    type="text"
                    value={marketingConfig.clarityProjectId}
                    onChange={(e) => updateMarketingConfig({ clarityProjectId: e.target.value })}
                    placeholder="k992810"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" /> ট্র্যাকিং কার্যকারিতা
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                পিক্সেল ও CAPI সক্রিয় থাকলে ইউজার পেজ ভিউ, অ্যাড টু কার্ট, চেকআউট ও পেমেন্টের ডেটা সরাসরি অ্যাডস প্ল্যাটফর্মে প্রেরিত হয়।
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'custom_code' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-base">কাস্টম স্ক্রিপ্ট ও এইচটিএমএল ইনজেকশন</h3>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Header Scripts (&lt;head&gt;)</span>
                    <span className="text-[10px] text-slate-400 font-mono">HTML / JS</span>
                  </label>
                  <textarea
                    rows={4}
                    value={marketingConfig.headerCode}
                    onChange={(e) => updateMarketingConfig({ headerCode: e.target.value })}
                    placeholder="<!-- Live Chat, Crisp, Tawk.to or Verification Meta tags -->"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-900 text-emerald-400 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Body Scripts (&lt;body&gt;)</span>
                    <span className="text-[10px] text-slate-400 font-mono">JS / GTM noscript</span>
                  </label>
                  <textarea
                    rows={4}
                    value={marketingConfig.bodyCode}
                    onChange={(e) => updateMarketingConfig({ bodyCode: e.target.value })}
                    placeholder="<!-- GTM noscript or Custom tracking pixel -->"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-900 text-emerald-400 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>Footer Scripts (&lt;/body&gt;)</span>
                    <span className="text-[10px] text-slate-400 font-mono">JS</span>
                  </label>
                  <textarea
                    rows={4}
                    value={marketingConfig.footerCode}
                    onChange={(e) => updateMarketingConfig({ footerCode: e.target.value })}
                    placeholder="<script> /* Custom Analytics or Tracking */ </script>"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-900 text-emerald-400 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
