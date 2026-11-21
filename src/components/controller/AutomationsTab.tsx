import React, { useState } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { 
  Zap, 
  MessageSquare, 
  Truck, 
  ShoppingCart, 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Sparkles,
  Search
} from 'lucide-react';

export default function AutomationsTab() {
  const { 
    automationsConfig, 
    updateAutomationsConfig, 
    addKeywordRule, 
    updateKeywordRule, 
    deleteKeywordRule 
  } = useSidebar();

  const [newKeyword, setNewKeyword] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [newMatchType, setNewMatchType] = useState<'exact' | 'contains'>('contains');
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newResponse.trim()) return;
    addKeywordRule({
      keyword: newKeyword.trim(),
      response: newResponse.trim(),
      matchType: newMatchType,
      enabled: true
    });
    setNewKeyword('');
    setNewResponse('');
  };

  const testKeywordTrigger = () => {
    const matched = automationsConfig.keywordRules.find(r => 
      r.enabled && (r.matchType === 'exact' ? testInput.trim().toLowerCase() === r.keyword.toLowerCase() : testInput.toLowerCase().includes(r.keyword.toLowerCase()))
    );

    if (matched) {
      setTestResult(`[ম্যাচ পাওয়া গেছে: "${matched.keyword}"]\n🤖 অটো-রেসপন্স:\n${matched.response}`);
    } else {
      setTestResult(`[কোনো কীওয়ার্ড রুল ম্যাচ করেনি]\n🤖 ডিফল্ট এআই বট রেসপন্স মোডে হ্যান্ডেল করবে।`);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 rounded-3xl p-6 text-white shadow-lg shadow-orange-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <Zap className="w-3.5 h-3.5" /> অটোমেশন ও স্মার্ট বট ওয়ার্কফ্লো
          </div>
          <h2 className="text-2xl font-black tracking-tight">ই-কমার্স হোয়াটসঅ্যাপ ও ইভেন্ট অটো-ট্রিগার</h2>
          <p className="text-orange-100 text-sm mt-1">
            অর্ডার কনফার্মেশন, পিডিএফ ইনভয়েস, কুরিয়ার ট্র্যাকিং ও পরিত্যক্ত কার্ট রিকভারি সম্পূর্ণ স্বয়ংক্রিয়ভাবে নিয়ন্ত্রণ করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: E-Commerce Triggers */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageSquare className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-slate-900 text-base">১. হোয়াটসঅ্যাপ ই-কমার্স অটো-ট্রিগার (Auto Triggers)</h3>
            </div>

            {/* Trigger 1: Auto Invoice */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <FileText className="w-4 h-4 text-blue-600" />
                  নতুন অর্ডারে অটোমেটিক PDF ইনভয়েস পাঠানো
                </div>
                <input
                  type="checkbox"
                  checked={automationsConfig.autoSendInvoiceOnOrder}
                  onChange={(e) => updateAutomationsConfig({ autoSendInvoiceOnOrder: e.target.checked })}
                  className="w-5 h-5 text-orange-600 rounded cursor-pointer"
                />
              </div>
              <textarea
                rows={2}
                value={automationsConfig.invoiceTemplate}
                onChange={(e) => updateAutomationsConfig({ invoiceTemplate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-orange-500 outline-none"
              />
              <div className="text-[11px] text-slate-500">
                ডায়নামিক ট্যাগ: <span className="font-mono text-blue-600">{`{customer_name}, {order_id}, {amount}, {invoice_url}`}</span>
              </div>
            </div>

            {/* Trigger 2: Courier Tracking */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  ডেলিভারি স্ট্যাটাস "Shipped" হলে অটো ট্র্যাকিং লিংক পাঠানো
                </div>
                <input
                  type="checkbox"
                  checked={automationsConfig.autoSendTrackingOnShipped}
                  onChange={(e) => updateAutomationsConfig({ autoSendTrackingOnShipped: e.target.checked })}
                  className="w-5 h-5 text-orange-600 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">ডিফল্ট কুরিয়ার পার্টনার:</span>
                <select
                  value={automationsConfig.courierPartner}
                  onChange={(e) => updateAutomationsConfig({ courierPartner: e.target.value as any })}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="steadfast">Steadfast Courier (API)</option>
                  <option value="pathao">Pathao Courier</option>
                  <option value="redx">RedX Delivery</option>
                  <option value="paperfly">Paperfly</option>
                </select>
              </div>
            </div>

            {/* Trigger 3: Abandoned Cart Recovery */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <ShoppingCart className="w-4 h-4 text-rose-600" />
                  AI Abandoned Cart Recovery (পরিত্যক্ত কার্ট পুনরুদ্ধার)
                </div>
                <input
                  type="checkbox"
                  checked={automationsConfig.abandonedCartRecovery}
                  onChange={(e) => updateAutomationsConfig({ abandonedCartRecovery: e.target.checked })}
                  className="w-5 h-5 text-orange-600 rounded cursor-pointer"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">ট্রিগার সময় (মিনিট পর)</label>
                  <input
                    type="number"
                    value={automationsConfig.abandonedCartDelayMinutes}
                    onChange={(e) => updateAutomationsConfig({ abandonedCartDelayMinutes: Number(e.target.value) || 15 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">ডিসকাউন্ট অফার (%)</label>
                  <input
                    type="number"
                    value={automationsConfig.abandonedCartDiscountPercent}
                    onChange={(e) => updateAutomationsConfig({ abandonedCartDiscountPercent: Number(e.target.value) || 5 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Keyword Auto-Responder Rules */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">২. কীওয়ার্ড অটো-রেসপন্ডার (Keyword Rules)</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {automationsConfig.keywordRules.length} টি রুল সক্রিয়
              </span>
            </div>

            {/* Add Rule Form */}
            <form onSubmit={handleAddRule} className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3">
              <div className="text-xs font-bold text-amber-900">নতুন কীওয়ার্ড রুল যুক্ত করুন:</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="যেমন: 'দাম কত', 'ডেলিভারি চার্জ'"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-amber-500"
                />
                <select
                  value={newMatchType}
                  onChange={(e) => setNewMatchType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                >
                  <option value="contains">Contains (লেখা থাকলেই)</option>
                  <option value="exact">Exact Match (হুবহু)</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" /> রুল যোগ করুন
                </button>
              </div>
              <textarea
                rows={2}
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="এই কীওয়ার্ডে গ্রাহককে স্বয়ংক্রিয়ভাবে কী উত্তর পাঠানো হবে তা লিখুন..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-amber-500"
              />
            </form>

            {/* List of rules */}
            <div className="space-y-3">
              {automationsConfig.keywordRules.map(rule => (
                <div key={rule.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
                        {rule.keyword}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                        {rule.matchType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => updateKeywordRule(rule.id, { enabled: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                        title="Enable/Disable"
                      />
                      <button
                        type="button"
                        onClick={() => deleteKeywordRule(rule.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {rule.response}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Right 5 Cols: Simulation Testing */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-6">
            <div className="p-4 bg-orange-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-wider">অটোমেশন সিমুলেটর (Simulator)</span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                একজন গ্রাহক হোয়াটসঅ্যাপে মেসেজ পাঠালে আপনার কনফিগার করা অটো-ট্রিগার ও কীওয়ার্ড ঠিকমতো কাজ করছে কিনা তা সরাসরি টেস্ট করুন।
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">কাস্টমার মেসেজ লিখুন:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="যেমন: আপনাদের ঠিকানা কোথায়?"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-none"
                  />
                  <button
                    type="button"
                    onClick={testKeywordTrigger}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    টেস্ট
                  </button>
                </div>
              </div>

              {/* Simulation Result */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs min-h-[140px] whitespace-pre-wrap leading-relaxed">
                {testResult || (
                  <span className="text-slate-500 italic">
                    একটি কাস্টমার মেসেজ লিখে 'টেস্ট' বাটনে ক্লিক করুন।
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
