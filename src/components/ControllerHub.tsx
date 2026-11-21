import React, { useState } from 'react';
import { 
  Sliders, 
  Palette, 
  Bot, 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  HardDrive, 
  BarChart3, 
  Download, 
  Upload, 
  RotateCcw, 
  Save,
  Sparkles,
  Database,
  CheckCircle2
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';

import BrandThemeTab from './controller/BrandThemeTab';
import HomepageControl from './HomepageControl';
import AIHubTab from './controller/AIHubTab';
import PaymentIntegrationsTab from './controller/PaymentIntegrationsTab';
import AutomationsTab from './controller/AutomationsTab';
import SecurityRBACTab from './controller/SecurityRBACTab';
import StorageBackupTab from './controller/StorageBackupTab';
import MarketingTrackingTab from './controller/MarketingTrackingTab';
import { Home } from 'lucide-react';

type ControllerTab = 'homepage' | 'brand_theme' | 'ai_hub' | 'gateways' | 'automations' | 'security_rbac' | 'storage_backup' | 'marketing';

export default function ControllerHub() {
  const { 
    exportAllConfigJSON, 
    importAllConfigJSON, 
    resetToDefaults, 
    saveToCloud, 
    restoreFromCloudSql,
    isSaving 
  } = useSidebar();
  
  const [activeTab, setActiveTab] = useState<ControllerTab>('homepage');
  const [sqlStatusMsg, setSqlStatusMsg] = useState<string | null>(null);

  const handleSqlRestore = async () => {
    setSqlStatusMsg('Cloud SQL থেকে ডেটা লোড হচ্ছে...');
    const success = await restoreFromCloudSql();
    if (success) {
      setSqlStatusMsg('✅ Cloud SQL থেকে সমস্ত ডেটা ও কনফিগারেশন সফলভাবে রিস্টোর হয়েছে!');
    } else {
      setSqlStatusMsg('⚠️ Cloud SQL-এ কোনো ব্যাকআপ পাওয়া যায়নি বা সংযোগে সমস্যা হয়েছে');
    }
    setTimeout(() => setSqlStatusMsg(null), 4000);
  };

  const handleSqlSave = async () => {
    setSqlStatusMsg('Cloud SQL-এ সেভ করা হচ্ছে...');
    await saveToCloud();
    setSqlStatusMsg('✅ Cloud SQL ডাটাবেসে সফলভাবে সেভ হয়েছে!');
    setTimeout(() => setSqlStatusMsg(null), 4000);
  };

  const tabs = [
    { id: 'homepage', label: '১. হোমপেজ কন্ট্রোলার', icon: Home, color: 'text-indigo-600', badge: 'Live Editor' },
    { id: 'brand_theme', label: '২. ব্র্যান্ড ও UI ইঞ্জিন', icon: Palette, color: 'text-blue-600', badge: 'Active' },
    { id: 'ai_hub', label: '৩. AI ও LLM হাব', icon: Bot, color: 'text-purple-600', badge: 'Multi-LLM' },
    { id: 'gateways', label: '৪. পেমেন্ট ও ইমেইল', icon: CreditCard, color: 'text-emerald-600', badge: 'Gateways' },
    { id: 'automations', label: '৫. অটোমেশন ও বট', icon: Zap, color: 'text-orange-600', badge: 'Webhook' },
    { id: 'security_rbac', label: '৬. সিকিউরিটি ও RBAC', icon: ShieldCheck, color: 'text-rose-600', badge: 'RBAC' },
    { id: 'storage_backup', label: '৭. স্টোরেজ ও ব্যাকআপ', icon: HardDrive, color: 'text-indigo-600', badge: 'Cloud' },
    { id: 'marketing', label: '৮. SEO, মার্কেটিং ও পিক্সেল', icon: BarChart3, color: 'text-cyan-600', badge: 'Google SEO' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-28">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-indigo-950/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black tracking-widest uppercase inline-block border border-indigo-500/30">
              CENTRAL CONFIGURATION HUB
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 border border-emerald-500/30">
              <Sparkles className="w-3 h-3" /> Real-time
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Sliders className="w-7 h-7 text-indigo-400" />
            কন্ট্রোলার (Controller)
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1.5 font-medium max-w-2xl leading-relaxed">
            ব্র্যান্ডিং, মাল্টি-মডেল এআই হাব, পেমেন্ট ও এসএমটিপি ইমেইল গেটওয়ে, অটোমেশন বট, আরবাক সিকিউরিটি ও ক্লাউড ব্যাকআপের সার্বিক কেন্দ্রীয় নিয়ন্ত্রণ প্যানেল।
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            onClick={handleSqlSave}
            disabled={isSaving}
            className="px-3.5 py-2.5 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-100 text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm border border-emerald-500/40 transition-all cursor-pointer shadow-sm"
            title="Cloud SQL PostgreSQL-এ সব ডেটা সেভ করুন"
          >
            <Database className="w-4 h-4 text-emerald-300" />
            {isSaving ? 'সংরক্ষণ হচ্ছে...' : 'SQL সেভ'}
          </button>
          <button
            onClick={handleSqlRestore}
            disabled={isSaving}
            className="px-3.5 py-2.5 rounded-2xl bg-cyan-600/30 hover:bg-cyan-600/40 text-cyan-100 text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm border border-cyan-500/40 transition-all cursor-pointer shadow-sm"
            title="হার্ড রিসেট হলে Cloud SQL থেকে সব ডেটা পুনরুদ্ধার করুন"
          >
            <Database className="w-4 h-4 text-cyan-300" />
            SQL রিস্টোর
          </button>
          <button
            onClick={exportAllConfigJSON}
            className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm border border-white/10 transition-all cursor-pointer shadow-sm"
            title="সম্পূর্ণ কনফিগারেশন JSON এক্সপোর্ট করুন"
          >
            <Download className="w-4 h-4 text-cyan-300" />
            JSON ব্যাকআপ
          </button>
          <button
            onClick={resetToDefaults}
            className="px-3.5 py-2.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold flex items-center gap-1.5 border border-rose-500/30 transition-all cursor-pointer"
            title="ফ্যাক্টরি রিসেট (রিসেট হলেও পরবর্তীতে SQL রিস্টোর দিয়ে সব ফেরত পাবেন)"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            রিসেট
          </button>
        </div>
      </div>

      {/* SQL Status Banner */}
      {sqlStatusMsg && (
        <div className="bg-slate-900/95 text-white px-4 py-2.5 rounded-xl border border-indigo-500/40 shadow-lg flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-semibold">{sqlStatusMsg}</span>
          </div>
          <button onClick={() => setSqlStatusMsg(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ControllerTab)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'homepage' && <HomepageControl />}
      {activeTab === 'brand_theme' && <BrandThemeTab />}
      {activeTab === 'ai_hub' && <AIHubTab />}
      {activeTab === 'gateways' && <PaymentIntegrationsTab />}
      {activeTab === 'automations' && <AutomationsTab />}
      {activeTab === 'security_rbac' && <SecurityRBACTab />}
      {activeTab === 'storage_backup' && <StorageBackupTab />}
      {activeTab === 'marketing' && <MarketingTrackingTab />}

      {/* Floating Realtime Cloud Sync Bar */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] w-[calc(100%-2rem)] max-w-lg bg-white/95 backdrop-blur-md px-6 py-4 rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex items-center justify-between gap-4 transition-all duration-300 ${isSaving ? 'scale-95 opacity-80' : 'hover:-translate-y-0.5'}`}>
        <div>
          <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase block">
            {isSaving ? 'SYNCING TO CLOUD...' : 'CENTRAL CLOUD SYNC'}
          </span>
          <span className="text-xs font-bold text-slate-800">
            {isSaving ? 'পরিবর্তন সেভ করা হচ্ছে...' : 'কন্ট্রোলারের সব সেটিংস রিয়েলটাইমে সেভ আছে'}
          </span>
        </div>
        <button 
          onClick={saveToCloud}
          disabled={isSaving}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
          <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
          সংরক্ষণ করুন (Save)
        </button>
      </div>
    </div>
  );
}
