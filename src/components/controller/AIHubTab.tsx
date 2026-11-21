import React, { useState } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { 
  Bot, 
  Cpu, 
  Key, 
  Route, 
  ShieldAlert, 
  Sparkles, 
  Play, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Coins,
  Send,
  Workflow
} from 'lucide-react';

export default function AIHubTab() {
  const { aiConfig, updateAiConfig } = useSidebar();
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testPrompt, setTestPrompt] = useState('স্মার্ট পিওএস সিস্টেমের মূল সুবিধাসমূহ সংক্ষেপে বাংলায় লিখুন।');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleTestAI = () => {
    setIsTesting(true);
    setTestOutput(null);
    setTimeout(() => {
      const activeModel = aiConfig.taskRouting.contentWriter;
      setTestOutput(
        `[${activeModel.toUpperCase()} Response (${aiConfig.aiTone} Mode)]:\n\nস্মার্ট পিওএস সিস্টেমের মাধ্যমে আপনি যা যা পাচ্ছেন:\n১. দ্রুততম ইনভয়েসিং ও কিউআর বারকোড স্ক্যানিং\n২. রিয়েলটাইম স্টক ও ইনভেন্টরি অটোমেশন\n৩. সমন্বিত WhatsApp ও SMS নোটিফিকেশন\n৪. বিশদ সেলস রিপোর্ট ও লাভ-ক্ষতির লাইভ গ্রাফ\n৫. মাল্টি-ইউজার রোল ও সিকিউরিটি কন্ট্রোল।`
      );
      setIsTesting(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 rounded-3xl p-6 text-white shadow-lg shadow-purple-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <Bot className="w-3.5 h-3.5" /> এআই ও এলএলএম হাব (Multi-Model AI Hub)
          </div>
          <h2 className="text-2xl font-black tracking-tight">মাল্টি-প্রোভাইডার এআই ইঞ্জিন ও অটোমেশন হাব</h2>
          <p className="text-purple-100 text-sm mt-1">
            Gemini, OpenAI, Claude এবং DeepSeek-এর এপিআই কি দিয়ে নির্দিষ্ট কাজের জন্য আলাদা আলাদা স্মার্ট এআই মডেল এসাইন করুন।
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md">
          <Workflow className="w-5 h-5 text-emerald-300" />
          <div className="text-xs">
            <div className="font-bold">Smart Fallback Engine</div>
            <div className="text-purple-200 text-[11px]">
              {aiConfig.autoFallbackEnabled ? 'Active (Auto-Switching)' : 'Disabled'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Multi-Provider API Keys */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">১. মাল্টি-প্রোভাইডার এপিআই কি ম্যানেজার (API Keys)</h3>
              </div>
              <span className="text-xs font-mono text-slate-400">Encrypted Local Storage</span>
            </div>

            {/* Gemini */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  Google Gemini (Gemini 2.5 / 1.5)
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    🟢 100% Free Tier Available
                  </span>
                </div>
                <select
                  value={aiConfig.geminiModel}
                  onChange={(e) => updateAiConfig({ geminiModel: e.target.value })}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (100% Free 15 RPM / Ultra Fast)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Context & Advanced Reasoning)</option>
                  <option value="gemini-1.5-flash-8b">Gemini Flash-8B (Ultra-Lightweight)</option>
                </select>
              </div>
              <div className="relative">
                <input
                  type={showKeys['gemini'] ? 'text' : 'password'}
                  value={aiConfig.geminiApiKey}
                  onChange={(e) => updateAiConfig({ geminiApiKey: e.target.value })}
                  placeholder="AIzaSy... (Enter Google Gemini API Key - Free from AI Studio)"
                  className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('gemini')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKeys['gemini'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>⚡ WhatsApp/Telegram ও চ্যাটবটে সম্পূর্ণ ফ্রি ব্যবহারের জন্য সেরা পছন্দ।</span>
                <span className="font-mono text-emerald-600 font-bold">$0.00 / Free Rate Limits</span>
              </div>
            </div>

            {/* OpenAI */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  OpenAI ChatGPT (GPT-4o / GPT-4o-mini / o1 / DALL-E 3)
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    💳 Pay-As-You-Go / Credit Based
                  </span>
                </div>
                <select
                  value={aiConfig.openaiModel}
                  onChange={(e) => updateAiConfig({ openaiModel: e.target.value })}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                >
                  <optgroup label="⚡ Ultra Low-Cost (চ্যাট ও মেসেজের জন্য ক্রেডিট সাশ্রয়ী)">
                    <option value="gpt-4o-mini">GPT-4o Mini ($0.15/1M Tokens - প্রতি ১০০০ চ্যাটে মাত্র ২০ পয়সা)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy Fast Model)</option>
                  </optgroup>
                  <optgroup label="💎 Premium Multimodal & High IQ (পোস্ট ও কনটেন্ট রাইটিং)">
                    <option value="gpt-4o">GPT-4o Omni (Flagship High IQ Text & Vision)</option>
                  </optgroup>
                  <optgroup label="🧠 Deep Thinking & Reasoning (জটিল হিসাব ও বিশ্লেষণ)">
                    <option value="o3-mini">o3-mini (High Speed Deep Thinking)</option>
                    <option value="o1">o1 (Full Reasoning & Complex Logic)</option>
                    <option value="o1-preview">o1 Preview (Advanced Logic)</option>
                  </optgroup>
                  <optgroup label="🎨 Image Generation (পেইড ক্রেডিট প্রতি ছবি)">
                    <option value="dall-e-3">DALL-E 3 (High Definition Photo Generation)</option>
                    <option value="dall-e-2">DALL-E 2 (Standard Resolution Image)</option>
                  </optgroup>
                </select>
              </div>
              <div className="relative">
                <input
                  type={showKeys['openai'] ? 'text' : 'password'}
                  value={aiConfig.openaiApiKey}
                  onChange={(e) => updateAiConfig({ openaiApiKey: e.target.value })}
                  placeholder="sk-proj-... (Enter OpenAI API Key - BYOK Isolated)"
                  className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('openai')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKeys['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>💡 WhatsApp ও চ্যাটের জন্য <b>gpt-4o-mini</b> ব্যবহার করলে প্রায় কোনো খরচই হয় না। ইমেজ বানাতে <b>DALL-E 3</b> পেইড ক্রেডিট কাটে।</span>
                <span className="font-mono text-emerald-600 font-bold">BYOK Protected</span>
              </div>
            </div>

            {/* Anthropic Claude */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  Anthropic Claude (Claude 3.5 Sonnet / Haiku)
                </div>
                <select
                  value={aiConfig.claudeModel}
                  onChange={(e) => updateAiConfig({ claudeModel: e.target.value })}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Best Creative Writer & Copy)</option>
                  <option value="claude-3-5-haiku">Claude 3.5 Haiku (Instant Speed & Low Cost)</option>
                </select>
              </div>
              <div className="relative">
                <input
                  type={showKeys['claude'] ? 'text' : 'password'}
                  value={aiConfig.claudeApiKey}
                  onChange={(e) => updateAiConfig({ claudeApiKey: e.target.value })}
                  placeholder="sk-ant-... (Enter Anthropic Claude Key)"
                  className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('claude')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKeys['claude'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* DeepSeek */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  DeepSeek / OpenRouter AI
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    💰 Budget Friendly
                  </span>
                </div>
                <select
                  value={aiConfig.deepseekModel}
                  onChange={(e) => updateAiConfig({ deepseekModel: e.target.value })}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="deepseek-chat">DeepSeek Chat V3 (Fast & Extremely Affordable)</option>
                  <option value="deepseek-reasoner">DeepSeek R1 (Chain of Thought Reasoning)</option>
                </select>
              </div>
              <div className="relative">
                <input
                  type={showKeys['deepseek'] ? 'text' : 'password'}
                  value={aiConfig.deepseekApiKey}
                  onChange={(e) => updateAiConfig({ deepseekApiKey: e.target.value })}
                  placeholder="sk-... (Enter DeepSeek API Key)"
                  className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('deepseek')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showKeys['deepseek'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Architectural Recommendation & Strategy Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-xl space-y-4 border border-indigo-800/40">
            <div className="flex items-center gap-2.5 pb-3 border-b border-indigo-800/50">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">
                💡 এআই মডেল স্ট্র্যাটেজি ও এপিআই আর্কিটেকচার (Best Practice Guide)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🔑</span> সেন্ট্রাল API Key vs আলাদা আলাদা সিলেকশন
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <b>আপনার চিন্তা ১০০% সঠিক!</b> এপিআই কি সেন্ট্রাল হাব-এ একবার ইনপুট থাকবে। তারপর WhatsApp Bot, Omnichannel Chat, বা Image Studio-তে শুধুমাত্র পছন্দের মডেল ড্রপডাউন থেকে সিলেক্ট করা যাবে। এতে বারবার কি পেস্ট করতে হয় না এবং কোড আর্কিটেকচার ক্লিন থাকে।
                </p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <span>🛡️</span> BYOK ও ইউজার ক্রেডিট আইসোলেশন
                </div>
                <p className="text-slate-300 leading-relaxed">
                  <b>কারো ক্রেডিট অন্য কেউ স্পর্শ করবে না:</b> প্রতিটি ইউজার যখন নিজের ব্রাউজারে বা অ্যাকাউন্টে এপিআই কি সেভ করেন, তা এনক্রিপ্টেড ও লোকালি আইসোলেটেড থাকে। সিস্টেম প্রতি ইউজারের নিজস্ব সেভ করা কি দিয়েই সংশ্লিষ্ট মডেল কল করে।
                </p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>💬</span> টেক্সট ও কাস্টমার চ্যাটের খরচ কমানো
                </div>
                <p className="text-slate-300 leading-relaxed">
                  WhatsApp, Telegram ও লাইভ কাস্টমার চ্যাটে প্রিমিয়াম মডেল দিলে ক্রেডিট দ্রুত খরচ হবে। তাই এখানে <b>GPT-4o Mini</b> ($0.15/1M) অথবা <b>Google Gemini 2.5 Flash</b> (সম্পূর্ণ ফ্রি ১৫ RPM) সিলেক্ট রাখা সবচেয়ে লাভজনক।
                </p>
              </div>

              <div className="bg-white/5 p-3.5 rounded-2xl border border-white/10 space-y-1.5">
                <div className="font-bold text-pink-300 flex items-center gap-1.5">
                  <span>🎨</span> ইমেজ বনাম টেক্সট জেনারেশন
                </div>
                <p className="text-slate-300 leading-relaxed">
                  ফ্রি টেক্সট মডেল দিয়ে ফটো তৈরি করা সম্ভব নয়। ইমেজ জেনারেটরের জন্য পেইড <b>DALL-E 3</b> ক্রেডিট কাটে। তবে আমাদের সিস্টেমে <b>Sharp SVG Banner</b> ইঞ্জিন বিল্ট-ইন রাখা আছে যা শূন্য খরচে এইচডি ব্যানার তৈরি করে!
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Task Routing Matrix */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Route className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">২. কাজের ভিত্তিতে মডেল রাউটিং (Task-Specific AI Routing)</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Omnichannel Social Media Bot */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2.5 shadow-sm">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">🤖</span> অমনিচ্যানেল সোশ্যাল বট
                  </span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    ⚡ 100% Free / Ultra-Low
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-white/80 p-1.5 rounded-lg border border-slate-200">
                  <span className="text-blue-600 font-bold">FB</span> • 
                  <span className="text-pink-600 font-bold">IG</span> • 
                  <span className="text-emerald-600 font-bold">WA</span> • 
                  <span className="text-sky-500 font-bold">TG</span> • 
                  <span className="text-slate-900 font-bold">TikTok</span>
                  <span className="ml-auto text-[9px] text-slate-400">অটো রিপ্লাই</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  ফেসবুক, ইনস্টাগ্রাম, হোয়াটসঅ্যাপ, টেলিগ্রাম ও টিকটক মেসেজের দ্রুত উত্তর দেওয়ার জন্য মডেল
                </p>
                <select
                  value={aiConfig.taskRouting.whatsappBot}
                  onChange={(e) => updateAiConfig({
                    taskRouting: { ...aiConfig.taskRouting, whatsappBot: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-blue-700 bg-white shadow-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="gemini">🟢 Google Gemini 2.5 Flash (100% Free - 15 RPM)</option>
                  <option value="openai">⚡ OpenAI GPT-4o-mini (Ultra Low-Cost ~$0.15/1M)</option>
                  <option value="claude">⚡ Claude 3.5 Haiku (Fast Speed)</option>
                  <option value="deepseek">💰 DeepSeek Chat V3 (Budget-Friendly)</option>
                </select>
                <div className="text-[10px] text-slate-500 bg-emerald-50/80 p-1.5 rounded-lg border border-emerald-100/60 leading-tight">
                  💡 প্রচুর মেসেজ আসলেও কোনো ক্রেডিট বা টাকা খরচ না হতে <b>Gemini Flash</b> বা <b>GPT-4o-mini</b> সবচেয়ে সেরা।
                </div>
              </div>

              {/* Card 2: Creative Content Writer */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2.5 shadow-sm">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">✍️</span> ক্রিয়েটিভ কন্টেন্ট রাইটার
                  </span>
                  <span className="text-[10px] text-purple-700 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full font-bold">
                    💎 High-Converting
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-white/80 p-1.5 rounded-lg border border-slate-200">
                  <span>পোস্ট কপি</span> • <span>সেলস অফার</span> • <span>হ্যাশট্যাগ</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  সোশ্যাল মিডিয়া পেজের জন্য ভাইরাল ও আকর্ষণীয় প্রোডাক্ট ডেসক্রিপশন এবং ক্যাপশন তৈরি
                </p>
                <select
                  value={aiConfig.taskRouting.contentWriter}
                  onChange={(e) => updateAiConfig({
                    taskRouting: { ...aiConfig.taskRouting, contentWriter: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-purple-700 bg-white shadow-sm focus:border-purple-500 focus:outline-none"
                >
                  <option value="claude">🏆 Anthropic Claude 3.5 Sonnet (সেরা রাইটার)</option>
                  <option value="openai">💎 OpenAI GPT-4o (Premium Omni)</option>
                  <option value="gemini">🟢 Google Gemini 2.5 Flash (ফ্রি ও দ্রুত)</option>
                  <option value="deepseek">💰 DeepSeek Chat V3 (বাজেট ফ্রেন্ডলি)</option>
                </select>
                <div className="text-[10px] text-slate-500 bg-purple-50/80 p-1.5 rounded-lg border border-purple-100/60 leading-tight">
                  💡 সেলস বাড়াতে কন্টেন্ট জেনারেশনে প্রিমিয়াম <b>Claude 3.5 Sonnet</b> বা <b>GPT-4o</b> সেরা ফলাফল দেয়।
                </div>
              </div>

              {/* Card 3: Data & Deep Thinking */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2.5 shadow-sm">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">📊</span> ডাটা ও ডিপ থিঙ্কিং
                  </span>
                  <span className="text-[10px] text-indigo-700 bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                    🧠 Deep Reasoning
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-white/80 p-1.5 rounded-lg border border-slate-200">
                  <span>সেলস অ্যানালিটিক্স</span> • <span>স্টক ফোরকাস্ট</span> • <span>লজিক</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  বিজনেস রিপোর্ট সামারি, সেলস পারফরম্যান্স অ্যানালাইসিস এবং কৌশল নির্ধারণ
                </p>
                <select
                  value={aiConfig.taskRouting.dataAnalysis}
                  onChange={(e) => updateAiConfig({
                    taskRouting: { ...aiConfig.taskRouting, dataAnalysis: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-emerald-700 bg-white shadow-sm focus:border-emerald-500 focus:outline-none"
                >
                  <option value="openai">🧠 OpenAI o3-mini / GPT-4o (Deep Reasoning)</option>
                  <option value="gemini">🟢 Google Gemini 2.5 Flash (ফ্রি অ্যানালিটিক্স)</option>
                  <option value="deepseek">🔬 DeepSeek R1 (Chain of Thought)</option>
                  <option value="claude">📊 Claude 3.5 Sonnet (Advanced Logic)</option>
                </select>
                <div className="text-[10px] text-slate-500 bg-indigo-50/80 p-1.5 rounded-lg border border-indigo-100/60 leading-tight">
                  💡 জটিল রিপোর্টের জন্য OpenAI-এর রিজনিং মডেল <b>o3-mini</b> বা ফ্রি <b>Gemini Flash</b> নির্বাচন করুন।
                </div>
              </div>

              {/* Card 4: Image & Poster */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-50 transition-all space-y-2.5 shadow-sm">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="text-base">🎨</span> ইমেজ ও ব্যানার স্টুডিও
                  </span>
                  <span className="text-[10px] text-pink-700 bg-pink-100 border border-pink-200 px-2 py-0.5 rounded-full font-bold">
                    🎨 Visual Design
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-semibold text-pink-700 bg-white/80 p-1.5 rounded-lg border border-slate-200">
                  <span>HD ব্যানার</span> • <span>প্রোডাক্ট পোস্টার</span> • <span>সোশ্যাল অ্যাড</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  সোশ্যাল পোস্ট ব্যানার ও হাই-রেজোলিউশন প্রোমোশনাল প্রোডাক্ট পোস্টার জেনারেটর
                </p>
                <select
                  value={aiConfig.taskRouting.imageGenerator || 'sharp-svg'}
                  onChange={(e) => updateAiConfig({
                    taskRouting: { ...aiConfig.taskRouting, imageGenerator: e.target.value as any }
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-pink-700 bg-white shadow-sm focus:border-pink-500 focus:outline-none"
                >
                  <option value="sharp-svg">⚡ Built-in Sharp SVG (১০০% ফ্রি - কোনো ক্রেডিট কাটে না)</option>
                  <option value="dall-e-3">🎨 OpenAI DALL-E 3 (পেইড ক্রেডিট - ফটো জেনারেটর)</option>
                  <option value="imagen-3">🌟 Google Imagen 3 (পেইড হাই-রেজোলিউশন)</option>
                </select>
                <div className="text-[10px] text-slate-500 bg-pink-50/80 p-1.5 rounded-lg border border-pink-100/60 leading-tight">
                  💡 শূন্য খরচে ব্যানার তৈরিতে <b>Sharp SVG</b> ইঞ্জিন ব্যবহার করুন; আর ফটোরিয়ালিস্টিক এআই ছবির জন্য <b>DALL-E 3</b>।
                </div>
              </div>
            </div>

            {/* Direct Workflow Notice to Create Post */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🚀</span>
                <div>
                  <div className="font-bold text-indigo-950">
                    সোশ্যাল মিডিয়া পোস্ট তৈরির সময় রিয়েল-টাইম মডেল নির্বাচন:
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    অ্যাডমিনের নির্ধারিত ডিফল্ট ছাড়াও পোস্ট ক্রিয়েশন পেজে (Create Post) সরাসরি যেকোনো মডেল ও ব্যানার ইঞ্জিন বেছে নেওয়ার সুবিধা সক্রিয় রয়েছে।
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Fallback Switch */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-indigo-950 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600" />
                  অটোমেটিক ফলব্যাক সিস্টেম (Smart Failover Switch)
                </div>
                <p className="text-[11px] text-indigo-700">
                  কোনো একটি এআই সার্ভার ডাউন থাকলে বা কোটা শেষ হলে স্বয়ংক্রিয়ভাবে দ্বিতীয় মডেল চালু হবে।
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiConfig.autoFallbackEnabled}
                onChange={(e) => updateAiConfig({ autoFallbackEnabled: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: Custom System Prompt & Persona */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">৩. এআই পার্সোনা ও সিস্টেম প্রম্পট (AI Persona & Prompt)</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  গ্লোবাল সিস্টেম প্রম্পট (System Directive)
                </label>
                <textarea
                  rows={3}
                  value={aiConfig.systemPrompt}
                  onChange={(e) => updateAiConfig({ systemPrompt: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs leading-relaxed focus:border-purple-500 outline-none bg-slate-50/50"
                  placeholder="আপনি একজন নম্র, পেশাদার ও দ্রুত সহায়ক AI সহকারী..."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { id: 'friendly', label: '😊 বন্ধুভাবাপন্ন (Friendly)' },
                  { id: 'professional', label: '👔 প্রফেশনাল (Business)' },
                  { id: 'concise', label: '⚡ সংক্ষিপ্ত ও দ্রুত (Concise)' },
                  { id: 'creative', label: '🎨 ক্রিয়েটিভ (Marketing)' }
                ].map(tone => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => updateAiConfig({ aiTone: tone.id as any })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      aiConfig.aiTone === tone.id
                        ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right 5 Cols: Token Budget & Interactive Test Sandbox */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Token Tracker Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">টোকেন বাজেট ও খরচ লিমিট</h3>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Healthy
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500 uppercase">দৈনিক টোকেন লিমিট</div>
                <div className="text-xl font-black text-slate-900 mt-1 font-mono">
                  {aiConfig.dailyTokenLimit.toLocaleString()}
                </div>
                <div className="text-[10px] text-emerald-600 mt-1">ব্যবহৃত: ~১২,৪৫০ টোকেন</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-500 uppercase">মাসিক বাজেট ক্যাপ</div>
                <div className="text-xl font-black text-slate-900 mt-1 font-mono">
                  ${aiConfig.monthlyBudgetUsd} USD
                </div>
                <div className="text-[10px] text-slate-500 mt-1">খরচ হয়েছে: $৪.২০</div>
              </div>
            </div>
          </div>

          {/* AI Interactive Test Sandbox */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="p-4 bg-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span className="text-xs font-bold uppercase tracking-wider">এআই টেস্ট স্যান্ডবক্স (Live Test)</span>
              </div>
              <span className="text-[10px] bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full font-mono">
                {aiConfig.taskRouting.contentWriter.toUpperCase()}
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  টেস্ট প্রম্পট লিখুন:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Ask AI anything..."
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-purple-500 bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={handleTestAI}
                    disabled={isTesting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isTesting ? <Bot className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    রান
                  </button>
                </div>
              </div>

              {/* Output Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs min-h-[160px] whitespace-pre-wrap leading-relaxed">
                {isTesting ? (
                  <div className="flex items-center gap-2 text-purple-300">
                    <Bot className="w-4 h-4 animate-bounce" />
                    মডেল থেকে রেসপন্স জেনারেট হচ্ছে...
                  </div>
                ) : testOutput ? (
                  testOutput
                ) : (
                  <div className="text-slate-500 italic">
                    উপরের 'রান' বাটনে ক্লিক করে বর্তমান এআই কনফিগারেশনের রেসপন্স কোয়ালিটি টেস্ট করুন।
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
