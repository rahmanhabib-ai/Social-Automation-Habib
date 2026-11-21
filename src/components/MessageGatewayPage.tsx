import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Smartphone, 
  Zap, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Send, 
  QrCode, 
  BatteryCharging, 
  Signal, 
  Cpu, 
  Check, 
  ShieldCheck, 
  Clock, 
  Sliders, 
  Radio, 
  Layers, 
  Sparkles, 
  FileText, 
  Trash2, 
  ArrowRight,
  ExternalLink,
  Info,
  PhoneCall,
  CheckCircle,
  HelpCircle,
  Code,
  Terminal,
  Download,
  Play,
  CheckCheck,
  Box
} from 'lucide-react';
import { PageItem, SidebarSection } from '../context/SidebarContext';
import AndroidAppPromptViewer from './AndroidAppPromptViewer';
import WhatsAppChannelsGroupsHub from './whatsapp/WhatsAppChannelsGroupsHub';

interface MessageGatewayPageProps {
  page?: PageItem;
  section?: SidebarSection;
  portalType?: 'admin' | 'user';
}

export type RoutingMode = 'whatsapp_first' | 'whatsapp_only' | 'sms_only' | 'dual_blast';

interface MessageTemplate {
  id: string;
  name: string;
  category: 'order' | 'invoice' | 'otp' | 'reminder' | 'marketing';
  text: string;
}

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'order_confirm',
    name: 'অর্ডার নিশ্চিতকরণ (Order Confirmation)',
    category: 'order',
    text: 'প্রিয় {customer_name}, আপনার অর্ডার #{order_id} সফলভাবে গ্রহণ করা হয়েছে। মোট বিল: {amount} টাকা। ধন্যবাদ, {store_name}!'
  },
  {
    id: 'invoice_delivery',
    name: 'ইনভয়েস ও বিলিং (Invoice Delivery)',
    category: 'invoice',
    text: 'প্রিয় {customer_name}, আপনার কেনাকাটার ই-মেমো/ইনভয়েস প্রস্তুত। ইনভয়েস লিংক: {tracking_url}। বিল: {amount} ৳।'
  },
  {
    id: 'otp_alert',
    name: 'ওটিপি ভেরিফিকেশন (OTP Alert)',
    category: 'otp',
    text: 'আপনার ওটিপি কোড হলো: 849201। এটি আগামী ৫ মিনিট কার্যকর থাকবে। এই কোডটি কারো সাথে শেয়ার করবেন না।'
  },
  {
    id: 'payment_reminder',
    name: 'পেমেন্ট রিমাইন্ডার (Payment Reminder)',
    category: 'reminder',
    text: 'প্রিয় {customer_name}, ইনভয়েস #{order_id} এর বাকি বিল {amount} টাকা পরিশোধের জন্য অনুরোধ করা যাচ্ছে। ধন্যবাদ, {store_name}।'
  },
  {
    id: 'marketing_promo',
    name: 'স্পেশাল ডিসকাউন্ট অফার (Special Promo)',
    category: 'marketing',
    text: '🎉 ধামাকা অফার! {store_name}-এ সকল প্রোডাক্টে পাচ্ছেন ১৫% ছাড়! ভিজিট করুন: {tracking_url}।'
  }
];

export default function MessageGatewayPage({ page, section, portalType = 'admin' }: MessageGatewayPageProps) {
  // 1. Central Routing Mode
  const [routingMode, setRoutingMode] = useState<RoutingMode>('whatsapp_first');
  
  // 2. Active Tab View
  const [activeTab, setActiveTab] = useState<'routing' | 'android_sim' | 'whatsapp' | 'channels_groups' | 'templates' | 'sandbox_logs' | 'android_prompt'>('routing');

  // WhatsApp Gateway State
  const [waStatus, setWaStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [waPhone, setWaPhone] = useState<string | null>(null);
  const [waQrCode, setWaQrCode] = useState<string | null>(null);
  const [isConnectingWa, setIsConnectingWa] = useState(false);

  // Android Gateway State
  const [androidDevice, setAndroidDevice] = useState({
    status: 'connected',
    deviceName: 'Samsung Galaxy S24 Ultra (Android 14)',
    sim1Name: 'Grameenphone 4G',
    sim2Name: 'Banglalink 4G',
    activeSim: 1,
    batteryLevel: 92,
    isCharging: true,
    networkSignal: 'Strong 4G LTE',
    pairingToken: 'HSSMS-SECURE-9821-TK88',
    pairingQrDataUrl: null as string | null,
    dailyCount: 48,
    dailyLimit: 1000
  });

  // Logs and Sandbox State
  const [logs, setLogs] = useState<any[]>([]);
  const [filterLog, setFilterLog] = useState<'all' | 'whatsapp' | 'phone_sms'>('all');
  const [copiedToken, setCopiedToken] = useState(false);

  // Test Sandbox Form
  const [testPhone, setTestPhone] = useState('+8801712345678');
  const [testMessage, setTestMessage] = useState(DEFAULT_TEMPLATES[0].text);
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_TEMPLATES[0].id);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch status from server
  const fetchGatewayStatus = async () => {
    try {
      const res = await fetch('/api/gateway/unified/status');
      if (res.ok) {
        const data = await res.json();
        if (data.whatsapp) {
          setWaStatus(data.whatsapp.status || 'disconnected');
          setWaPhone(data.whatsapp.phone || null);
          setWaQrCode(data.whatsapp.qrCode || null);
        }
        if (data.androidDevice) {
          setAndroidDevice(prev => ({
            ...prev,
            ...data.androidDevice
          }));
        }
        if (data.logs) {
          setLogs(data.logs);
        }
      }
    } catch (e) {
      // Silently tolerate background polling disconnection/server reloads
    }
  };

  useEffect(() => {
    fetchGatewayStatus();
    const interval = setInterval(fetchGatewayStatus, 4000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Connect WhatsApp
  const handleConnectWhatsApp = async () => {
    setIsConnectingWa(true);
    try {
      const res = await fetch('/api/whatsapp/connect', { method: 'POST' });
      const data = await res.json();
      if (data.qrCode) {
        setWaQrCode(data.qrCode);
        setWaStatus(data.status);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConnectingWa(false);
    }
  };

  // Refresh Android Pairing QR
  const handleRefreshAndroidQR = async () => {
    try {
      const res = await fetch('/api/gateway/android/refresh-qr', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setAndroidDevice(prev => ({
          ...prev,
          pairingToken: data.token,
          pairingQrDataUrl: data.qrCode
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Switch SIM slot
  const handleSetSim = async (slot: 1 | 2) => {
    setAndroidDevice(prev => ({ ...prev, activeSim: slot }));
    try {
      await fetch('/api/gateway/android/set-sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ simSlot: slot })
      });
    } catch (e) {}
  };

  // Dispatch message via Sandbox
  const handleDispatchTest = async () => {
    if (!testPhone || !testMessage) return;
    setIsSending(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/gateway/unified/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          message: testMessage,
          routingMode: routingMode,
          simSlot: androidDevice.activeSim
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult({
          success: true,
          message: `সফলভাবে প্রেরিত! চ্যানেল: ${data.channel} (${data.status})`
        });
        fetchGatewayStatus();
      } else {
        setSendResult({
          success: false,
          message: data.error || 'মেসেজ পাঠাতে সমস্যা হয়েছে।'
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        message: err.message || 'সার্ভার সংযোগ সমস্যা।'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Insert Variable to Test Message
  const handleInsertTag = (tag: string) => {
    setTestMessage(prev => prev + ' ' + tag);
  };

  // Clear Logs
  const handleClearLogs = async () => {
    try {
      await fetch('/api/gateway/logs/clear', { method: 'POST' });
      setLogs([]);
    } catch (e) {}
  };

  // Share Modal & Clean Public URL State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);

  // Derive the clean production standalone link dynamically based on the current origin
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const cleanPublicAppUrl = `${currentOrigin}/${portalType || 'admin'}/message_gateway`;

  const handleCopyPublicUrl = () => {
    navigator.clipboard.writeText(cleanPublicAppUrl);
    setCopiedPublicLink(true);
    setTimeout(() => setCopiedPublicLink(false), 2500);
  };

  const filteredLogs = logs.filter(l => {
    if (filterLog === 'whatsapp') return l.channel === 'whatsapp';
    if (filterLog === 'phone_sms') return l.channel === 'phone_sms';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-indigo-950/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black tracking-widest uppercase inline-block border border-indigo-500/30">
              UNIFIED HYBRID MESSAGING ENGINE
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 border border-emerald-500/30">
              <Sparkles className="w-3 h-3" /> WhatsApp & Phone SIM
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-indigo-400" />
            মেসেজ গেটওয়ে (Message Gateway)
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1.5 font-medium max-w-2xl leading-relaxed">
            স্মার্ট হাইব্রিড মেসেজিং হাব: প্রথমে ফ্রি হোয়াটসঅ্যাপ মেসেজ পাঠানো হবে, ব্যর্থ হলে সরাসরি আপনার সংযুক্ত অ্যান্ড্রয়েড ফোন সিম থেকে স্বয়ংক্রিয়ভাবে অফিশিয়াল এসএমএস পৌঁছে যাবে।
          </p>
        </div>

        {/* Live Status Indicators & Clean Share Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer border border-emerald-400/30"
          >
            <ExternalLink className="w-4 h-4" />
            <span>ক্লিন অ্যাপ লিংক (Direct Public App)</span>
          </button>

          <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <span className={`w-2.5 h-2.5 rounded-full ${waStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-300 block">WHATSAPP</span>
                <span className="text-xs font-bold text-white">{waStatus === 'connected' ? (waPhone || 'Online') : 'Offline'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <span className={`w-2.5 h-2.5 rounded-full ${androidDevice.status === 'connected' ? 'bg-indigo-400 animate-pulse' : 'bg-rose-400'}`}></span>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-300 block">PHONE SIM GATEWAY</span>
                <span className="text-xs font-bold text-white">{androidDevice.status === 'connected' ? 'SIM 1 (GP)' : 'Offline'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 flex-nowrap shrink-0">
          <button
            onClick={() => setActiveTab('routing')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'routing' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            ১. স্মার্ট রাউটিং মোড (Routing)
          </button>

          <button
            onClick={() => setActiveTab('android_sim')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'android_sim' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Smartphone className="w-4 h-4 text-blue-500" />
            ২. অ্যান্ড্রয়েড সিম গেটওয়ে (Phone Hub)
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'whatsapp' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-500" />
            ৩. হোয়াটসঅ্যাপ ইঞ্জিন (WhatsApp Engine)
          </button>

          <button
            onClick={() => setActiveTab('channels_groups')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'channels_groups' ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/20' : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-black'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-600" />
            ৪. আনলিমিটেড চ্যানেল ও গ্রুপ হাব (Channels & Groups Hub) 📢
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'templates' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-purple-500" />
            ৫. মেসেজ টেমপ্লেটস (Templates)
          </button>

          <button
            onClick={() => setActiveTab('sandbox_logs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'sandbox_logs' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4 text-orange-500" />
            ৬. টেস্ট স্যান্ডবক্স ও লাইভ লগ (Logs)
          </button>

          <button
            onClick={() => setActiveTab('android_prompt')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'android_prompt' ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/20' : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-black'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-400" />
            ৭. অ্যান্ড্রয়েড অ্যাপ প্রম্পট (Android App Prompt)
          </button>
        </div>
      </div>

      {/* TAB 1: Smart Routing Engine */}
      {activeTab === 'routing' && (
        <div className="space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                CHANNEL ROUTING STRATEGY
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">মেসেজ প্রেরণের চ্যানেল ও ফেইলওভার নিয়ম সিলেক্ট করুন</h2>
              <p className="text-xs text-slate-500 mt-1">
                আপনার ব্যবসার সুবিধা অনুযায়ী চ্যানেল সিলেক্ট করুন। ডিফল্টভাবে স্মার্ট ফেইলওভার মোড চালু রাখলে কোনো কাস্টমারই মেসেজ মিস করবে না।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: WhatsApp First, fallback to Phone SMS */}
              <div 
                onClick={() => setRoutingMode('whatsapp_first')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  routingMode === 'whatsapp_first' 
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                      🟢
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">WhatsApp First, Fallback to Phone SMS</h3>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[9px] font-black uppercase">
                          RECOMMENDED
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        সিস্টেম প্রথমে হোয়াটসঅ্যাপে মেসেজ পাঠানোর চেষ্টা করবে (০ টাকা খরচ)। যদি কোনো কারণে কাস্টমারের হোয়াটসঅ্যাপ না থাকে বা মেসেজ ফেইল হয়, তাহলে স্বয়ংক্রিয়ভাবে সংযুক্ত অ্যান্ড্রয়েড ফোনের সিমকার্ড দিয়ে অফিশিয়াল এসএমএস পাঠিয়ে দেবে।
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${routingMode === 'whatsapp_first' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                    {routingMode === 'whatsapp_first' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Option 2: WhatsApp Only */}
              <div 
                onClick={() => setRoutingMode('whatsapp_only')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  routingMode === 'whatsapp_only' 
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-md ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                      💬
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">WhatsApp Only</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        সকল মেসেজ, ইনভয়েস লিংক ও ওটিপি অ্যালার্ট শুধুমাত্র হোয়াটসঅ্যাপ অ্যাকাউন্টের মাধ্যমে ডেলিভারি করা হবে। কোনো এসএমএস খরচ হবে না।
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${routingMode === 'whatsapp_only' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
                    {routingMode === 'whatsapp_only' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Option 3: Phone SMS Gateway Only */}
              <div 
                onClick={() => setRoutingMode('sms_only')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  routingMode === 'sms_only' 
                    ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                      📱
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Android Phone SMS Gateway Only</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        সরাসরি সংযুক্ত অ্যান্ড্রয়েড ফোনের সিমকার্ড (যেমন GP/Robi আনলিমিটেড এসএমএস বান্ডেল) ব্যবহার করে কাস্টমারের ইনবক্সে সাধারণ এসএমএস যাবে।
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${routingMode === 'sms_only' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                    {routingMode === 'sms_only' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>

              {/* Option 4: Dual Blast */}
              <div 
                onClick={() => setRoutingMode('dual_blast')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  routingMode === 'dual_blast' 
                    ? 'border-orange-600 bg-orange-50/40 shadow-md ring-2 ring-orange-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
                      ⚡
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Dual Blast (WhatsApp + Phone SMS)</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        অর্ডার নিশ্চিতকরণ বা জরুরি নোটিফিকেশনের সময় একই সাথে হোয়াটসঅ্যাপ এবং মোবাইলের সিমকার্ড এসএমএস উভয় চ্যানেলে মেসেজ যাবে।
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${routingMode === 'dual_blast' ? 'border-orange-600 bg-orange-600 text-white' : 'border-slate-300'}`}>
                    {routingMode === 'dual_blast' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Workflow Diagram */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                <Layers className="w-4 h-4 text-indigo-600" />
                বর্তমান অ্যাক্টিভ ওয়ার্কফ্লো প্রিভিউ
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 flex-wrap">
                <span className="px-3 py-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  📦 পিওএস / অনলাইন অর্ডার ইভেন্ট
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-xl border border-indigo-200 shadow-xs">
                  {routingMode === 'whatsapp_first' ? 'হোয়াটসঅ্যাপ মেসেজ পাঠানো' : routingMode === 'sms_only' ? 'ফোন এসএমএস পাঠানো' : routingMode === 'whatsapp_only' ? 'হোয়াটসঅ্যাপ অনলি' : 'ডুয়াল ব্রডকাস্ট'}
                </span>
                {routingMode === 'whatsapp_first' && (
                  <>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-xl border border-amber-200 shadow-xs flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> ফেইল হলে ➔ ফোন সিম এসএমএস
                    </span>
                  </>
                )}
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 shadow-xs flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> কাস্টমার ইনবক্সে ডেলিভারি নিশ্চিত
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Android Phone SMS Gateway Hub */}
      {activeTab === 'android_sim' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: QR Code & Pairing */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                  MOBILE APP PAIRING
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">অ্যান্ড্রয়েড ফোন কিউআর পেয়ারিং</h3>
              </div>
              <button
                onClick={handleRefreshAndroidQR}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer"
                title="নতুন QR কোড তৈরি করুন"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
              {androidDevice.pairingQrDataUrl ? (
                <img 
                  src={androidDevice.pairingQrDataUrl} 
                  alt="Android Gateway QR" 
                  className="w-52 h-52 object-contain bg-white p-2 rounded-xl shadow-xs border border-slate-200"
                />
              ) : (
                <div className="w-52 h-52 bg-white rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                  <QrCode className="w-12 h-12 mb-2 text-slate-300" />
                  <span className="text-xs font-semibold">কিউআর জেনারেট হচ্ছে...</span>
                </div>
              )}
              <p className="text-xs font-bold text-slate-700 mt-3">
                আপনার মোবাইল অ্যাপের স্ক্যানার দিয়ে এই QR কোডটি স্ক্যান করুন।
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                স্ক্যান সম্পন্ন হলে স্বয়ংক্রিয়ভাবে সার্ভারের সাথে ফোনটি লাইভ পেয়ার হয়ে যাবে।
              </p>
            </div>

            {/* Pairing Token Box */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                ম্যানুয়াল পেয়ারিং টোকেন (Security Token)
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={androidDevice.pairingToken}
                  className="flex-1 p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(androidDevice.pairingToken);
                    setCopiedToken(true);
                    setTimeout(() => setCopiedToken(false), 2000);
                  }}
                  className="px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedToken ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedToken ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Connected Device & SIM Status */}
          <div className="lg:col-span-7 space-y-6">
            {/* Device Info Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{androidDevice.deviceName}</h3>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[9px] font-black uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        CONNECTED
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">Android Native SMS Background Service Live</span>
                  </div>
                </div>
              </div>

              {/* Status Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> ব্যাটারি স্ট্যাটাস
                  </span>
                  <span className="text-sm font-black text-slate-800 mt-1 block">
                    {androidDevice.batteryLevel}% {androidDevice.isCharging ? '(Charging)' : ''}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <Signal className="w-3.5 h-3.5 text-blue-600" /> নেটওয়ার্ক সিগন্যাল
                  </span>
                  <span className="text-sm font-black text-slate-800 mt-1 block">
                    {androidDevice.networkSignal}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                    <Send className="w-3.5 h-3.5 text-indigo-600" /> আজকের পাঠানো SMS
                  </span>
                  <span className="text-sm font-black text-slate-800 mt-1 block">
                    {androidDevice.dailyCount} / {androidDevice.dailyLimit}
                  </span>
                </div>
              </div>

              {/* Active SIM Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 block">
                  ডিফল্ট প্রেরক সিম নির্বাচন করুন (Select Active SIM Slot):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div 
                    onClick={() => handleSetSim(1)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      androidDevice.activeSim === 1 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        SIM 1
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{androidDevice.sim1Name}</span>
                        <span className="text-[10px] text-slate-500">Unlimited Pack Active</span>
                      </div>
                    </div>
                    {androidDevice.activeSim === 1 && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>

                  <div 
                    onClick={() => handleSetSim(2)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      androidDevice.activeSim === 2 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-700">
                        SIM 2
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{androidDevice.sim2Name}</span>
                        <span className="text-[10px] text-slate-500">Corporate Package</span>
                      </div>
                    </div>
                    {androidDevice.activeSim === 2 && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Native App Architecture Note */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-6 rounded-3xl border border-blue-900 shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <h4 className="text-sm font-bold text-white">কিভাবে কাজ করে আমাদের নিজস্ব Android গেটওয়ে?</h4>
              </div>
              <p className="text-xs text-blue-200 leading-relaxed font-normal">
                আমাদের মোবাইল অ্যাপটি ফোনের ব্যাকগ্রাউন্ডে নিরবচ্ছিন্নভাবে চলে। যখনই আমাদের ওয়েব সার্ভার কোনো এসএমএস ট্রিগার করে, অ্যাপটি সিকিউর WebSocket / Polling এর মাধ্যমে রিকোয়েস্ট গ্রহণ করে এবং ফোনের নেটিভ <code className="bg-white/10 px-1 py-0.5 rounded font-mono">SmsManager</code> API দিয়ে মুহূর্তেই কাস্টমারকে এসএমএস পাঠিয়ে ডেলিভারি স্ট্যাটাস সার্ভারে রিপোর্ট করে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: WhatsApp Engine */}
      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                WHATSAPP MULTI-DEVICE
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">হোয়াটসঅ্যাপ অ্যাকাউন্ট কানেকশন</h3>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center">
              {waStatus === 'connected' ? (
                <div className="space-y-3 py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">হোয়াটসঅ্যাপ সফলভাবে সংযুক্ত</h4>
                    <p className="text-xs font-semibold text-slate-500 mt-1">সংযুক্ত নাম্বার: {waPhone || 'Active Account'}</p>
                  </div>
                </div>
              ) : waQrCode ? (
                <div className="space-y-3">
                  <img src={waQrCode} alt="WhatsApp QR" className="w-56 h-56 object-contain bg-white p-2 rounded-xl shadow-xs border border-slate-200 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">আপনার WhatsApp &gt; Linked Devices থেকে স্ক্যান করুন।</p>
                </div>
              ) : (
                <div className="py-8 space-y-4">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">হোয়াটসঅ্যাপ এখনো সংযুক্ত করা হয়নি</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">নিচের বাটনে চাপ দিয়ে QR কোড তৈরি করুন।</p>
                  </div>
                  <button
                    onClick={handleConnectWhatsApp}
                    disabled={isConnectingWa}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isConnectingWa ? 'জেনারেট হচ্ছে...' : 'QR কোড তৈরি করুন'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black">আনলিমিটেড চ্যানেল ও গ্রুপ ব্রডকাস্ট হাব</h4>
                  <p className="text-[11px] text-emerald-100">হাজার হাজার চ্যানেল ও গ্রুপে এক ক্লিকে টেক্সট, ছবি ও ভিডিও পাঠান</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('channels_groups')}
                className="px-4 py-2 bg-white text-emerald-800 rounded-xl text-xs font-black hover:bg-emerald-50 transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                স্টুডিও ওপেন করুন ➔
              </button>
            </div>

            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">হোয়াটসঅ্যাপ মার্কেটিং ও সিকিউরিটি টিপস</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p><strong>১০০% ফ্রি ও আনলিমিটেড:</strong> হোয়াটসঅ্যাপ নোটিফিকেশনে কোনো এসএমএস গেটওয়ে খরচ নেই।</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p><strong>রিচ মিডিয়া সাপোর্ট:</strong> পিডিএফ ইনভয়েস, রসিদের ইমেজ এবং অ্যাকশনেবল বাটন সাপোর্ট করে।</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p><strong>স্মার্ট ব্যাকআপ অন:</strong> কাস্টমারের ফোনে ইন্টারনেট বন্ধ থাকলে আমাদের সিস্টেম তৎক্ষণাৎ ফোনের সিম কার্ড দিয়ে এসএমএস পাঠিয়ে দেয়।</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WhatsApp Unlimited Channels & Groups Broadcast Hub */}
      {activeTab === 'channels_groups' && (
        <div className="space-y-6">
          <WhatsAppChannelsGroupsHub />
        </div>
      )}

      {/* TAB 4: Templates Builder */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">মেসেজ টেমপ্লেট লাইব্রেরি</h3>
                <span className="text-xs text-slate-400 font-bold">{DEFAULT_TEMPLATES.length} টি রেডি টেমপ্লেট</span>
              </div>

              <div className="space-y-3">
                {DEFAULT_TEMPLATES.map(tmpl => (
                  <div
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplateId(tmpl.id);
                      setTestMessage(tmpl.text);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      selectedTemplateId === tmpl.id 
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-900">{tmpl.name}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase">{tmpl.category}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{tmpl.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">ডাইনামিক ভেরিয়েবল ট্যাগস</h3>
              <p className="text-xs text-slate-500">যেকোনো ট্যাগে ক্লিক করলে তা মেসেজ বডিতে ইনসার্ট হবে:</p>
              
              <div className="flex flex-wrap gap-2">
                {[
                  { tag: '{customer_name}', label: 'কাস্টমারের নাম' },
                  { tag: '{order_id}', label: 'অর্ডার নাম্বার' },
                  { tag: '{amount}', label: 'টাকার পরিমাণ' },
                  { tag: '{store_name}', label: 'দোকানের নাম' },
                  { tag: '{tracking_url}', label: 'ইনভয়েস / ট্র্যাকিং লিংক' },
                  { tag: '{date}', label: 'তারিখ' }
                ].map(item => (
                  <button
                    key={item.tag}
                    onClick={() => handleInsertTag(item.tag)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border border-slate-200"
                  >
                    {item.tag} <span className="text-[10px] text-slate-400 font-sans">({item.label})</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">লাইভ টেমপ্লেট প্রিভিউ এডিটর</label>
                <textarea
                  rows={4}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-2xl bg-slate-50 text-xs text-slate-800 font-sans outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Test Sandbox & Live Logs */}
      {activeTab === 'sandbox_logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Dispatch Sandbox Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                LIVE SANDBOX TESTING
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">টেস্ট মেসেজ ডিসপ্যাচার</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">প্রাপকের মোবাইল নাম্বার</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="+88017XXXXXXXX"
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">মেসেজ কন্টেন্ট</label>
                <textarea
                  rows={4}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-800 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>বর্তমান চ্যানেল মোড:</span>
                <span className="font-bold text-indigo-700 uppercase">{routingMode.replace('_', ' ')}</span>
              </div>

              {sendResult && (
                <div className={`p-3 rounded-xl text-xs font-bold ${sendResult.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {sendResult.message}
                </div>
              )}

              <button
                onClick={handleDispatchTest}
                disabled={isSending}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${isSending ? 'animate-spin' : ''}`} />
                {isSending ? 'মেসেজ পাঠানো হচ্ছে...' : 'টেস্ট মেসেজ পাঠান (Send Test)'}
              </button>
            </div>
          </div>

          {/* Live Delivery Audit Log Table */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900">লাইভ মেসেজ অডিট লগ ও রিপোর্ট</h3>
                <span className="text-xs text-slate-400">প্রতিটি মেসেজের চ্যানেল ও ডেলিভারি স্ট্যাটাস</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-[11px] font-bold">
                  <button 
                    onClick={() => setFilterLog('all')} 
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${filterLog === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setFilterLog('whatsapp')} 
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${filterLog === 'whatsapp' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'}`}
                  >
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => setFilterLog('phone_sms')} 
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${filterLog === 'phone_sms' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500'}`}
                  >
                    Phone SIM
                  </button>
                </div>

                <button
                  onClick={handleClearLogs}
                  className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="ক্লিয়ার লগ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {filteredLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  কোনো লগ রেকর্ড পাওয়া যায়নি।
                </div>
              ) : (
                filteredLogs.map(log => (
                  <div key={log.id} className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition-all space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          log.channel === 'whatsapp' ? 'bg-emerald-100 text-emerald-800' :
                          log.channel === 'phone_sms' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{log.phone}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{log.text}</p>
                    {log.details && (
                      <span className="text-[10px] text-indigo-600 font-semibold block">{log.details}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Android App Prompt & Multi-Project Master Hub */}
      {activeTab === 'android_prompt' && (
        <AndroidAppPromptViewer 
          pairingToken={androidDevice.pairingToken}
          pairingEndpoint={typeof window !== 'undefined' ? window.location.origin : ''}
        />
      )}

      {/* Standalone Direct Public Link Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex justify-between items-start">
              <div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  NO AI STUDIO FRAME • STANDALONE APP
                </span>
                <h3 className="text-xl font-black text-white mt-1.5 flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-emerald-400" />
                  ক্লিন পাবলিক ডিরেক্ট ওয়েব অ্যাপ লিংক
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  এই লিংকটি আপনি যাকে দেবেন সে সরাসরি একটি পূর্ণাঙ্গ অ্যাপ হিসেবে দেখতে পাবে (কোনো গুগল স্টুডিও এডিটর স্ক্রিন থাকবে না)।
                </p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-xl bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Direct Link Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>ডিরেক্ট অ্যাপ ইউআরএল (Standalone Public URL):</span>
                  <span className="text-[11px] text-emerald-600 font-semibold">✓ ১০০% রেডি টু শেয়ার</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={cleanPublicAppUrl}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-800 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyPublicUrl}
                    className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-sm ${
                      copiedPublicLink ? 'bg-emerald-500 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {copiedPublicLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedPublicLink ? 'কপি হয়েছে!' : 'কপি লিংক'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <button
                  onClick={handleCopyPublicUrl}
                  className="w-full px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedPublicLink ? 'ক্লিন লিংক কপি সম্পন্ন হয়েছে ✓' : 'ক্লিন লিংক কপি করুন'}</span>
                </button>
              </div>

              {/* Notice Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> কীভাবে কাজ করে?
                </div>
                <p className="leading-relaxed text-[11px] text-slate-500">
                  এটি Google Cloud Run পরিচালিত প্রোডাকশন প্রিভিউ লিংক। ক্লায়েন্ট বা ইউজার যখন এই লিংকে ঢুকবে, সে কোনো প্রকার চ্যাট বা কোড উইন্ডো দেখতে পাবে না; শুধু সরাসরি আপনার পুরো অ্যাপ্লিকেশনটি ফুল স্ক্রিনে দেখতে পাবে।
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
