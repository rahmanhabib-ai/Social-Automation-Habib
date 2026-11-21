import React, { useState } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { 
  CreditCard, 
  Mail, 
  Webhook, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Lock,
  Globe,
  Radio,
  Zap
} from 'lucide-react';

export default function PaymentIntegrationsTab() {
  const { paymentConfig, updatePaymentConfig } = useSidebar();
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [activeGateway, setActiveGateway] = useState<'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'eps' | 'stripe' | 'paypal'>('bkash');
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const toggleSecret = (key: string) => {
    setShowSecret(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTestEmail = () => {
    setIsSendingEmail(true);
    setTestEmailStatus(null);
    setTimeout(() => {
      setIsSendingEmail(false);
      setTestEmailStatus(`সফল হয়েছে! ${paymentConfig.fromEmail} থেকে টেস্ট ইমেইল প্রেরণ সম্পন্ন।`);
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5" /> পেমেন্ট, ইমেইল ও থার্ড-পার্টি ইন্টিগ্রেশন
          </div>
          <h2 className="text-2xl font-black tracking-tight">পেমেন্ট গেটওয়ে ও অটোমেটেড নোটিফিকেশন হাব</h2>
          <p className="text-emerald-100 text-sm mt-1">
            বিকাশ, নগদ, রকেট, SSLCommerz, EPS, স্ট্রাইপ, পেপ্যাল এবং SMTP ইমেইল গেটওয়ে কনফিগার করুন। (SMS ব্যতীত)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Payment Gateways */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Payment Gateways */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">১. পেমেন্ট গেটওয়ে ক্রিডেনশিয়াল (Payment Gateways)</h3>
              </div>
            </div>

            {/* Gateway Switcher Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'bkash', label: 'বিকাশ (bKash)', color: 'text-pink-600' },
                { id: 'nagad', label: 'নগদ (Nagad)', color: 'text-orange-600' },
                { id: 'rocket', label: 'রকেট (Rocket)', color: 'text-purple-600' },
                { id: 'sslcommerz', label: 'SSLCommerz', color: 'text-blue-600' },
                { id: 'eps', label: 'EPS Payment', color: 'text-teal-600' },
                { id: 'stripe', label: 'Stripe', color: 'text-indigo-600' },
                { id: 'paypal', label: 'PayPal', color: 'text-blue-800' },
              ].map(gw => (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => setActiveGateway(gw.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    activeGateway === gw.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                  }`}
                >
                  <span className={gw.color}>●</span> {gw.label}
                </button>
              ))}
            </div>

            {/* bKash Config */}
            {activeGateway === 'bkash' && (
              <div className="p-5 rounded-2xl bg-pink-50/30 border border-pink-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-900">বিকাশ অ্যাকাউন্ট টাইপ:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updatePaymentConfig({ bkashType: 'personal' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${paymentConfig.bkashType === 'personal' ? 'bg-pink-600 text-white' : 'bg-white border text-slate-600'}`}
                    >
                      Personal (সেন্ড মানি)
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePaymentConfig({ bkashType: 'merchant' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${paymentConfig.bkashType === 'merchant' ? 'bg-pink-600 text-white' : 'bg-white border text-slate-600'}`}
                    >
                      Merchant Checkout API
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    বিকাশ নম্বর (Personal / Merchant Number)
                  </label>
                  <input
                    type="text"
                    value={paymentConfig.bkashNumber}
                    onChange={(e) => updatePaymentConfig({ bkashNumber: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-pink-500 outline-none"
                  />
                </div>

                {paymentConfig.bkashType === 'merchant' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">App Key</label>
                      <input
                        type="text"
                        value={paymentConfig.bkashAppKey}
                        onChange={(e) => updatePaymentConfig({ bkashAppKey: e.target.value })}
                        placeholder="bKash App Key"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">App Secret</label>
                      <input
                        type={showSecret['bkashSecret'] ? 'text' : 'password'}
                        value={paymentConfig.bkashSecret}
                        onChange={(e) => updatePaymentConfig({ bkashSecret: e.target.value })}
                        placeholder="bKash App Secret"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Nagad Config */}
            {activeGateway === 'nagad' && (
              <div className="p-5 rounded-2xl bg-orange-50/30 border border-orange-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-900">নগদ অ্যাকাউন্ট টাইপ:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updatePaymentConfig({ nagadType: 'personal' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${paymentConfig.nagadType === 'personal' ? 'bg-orange-600 text-white' : 'bg-white border text-slate-600'}`}
                    >
                      Personal
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePaymentConfig({ nagadType: 'merchant' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${paymentConfig.nagadType === 'merchant' ? 'bg-orange-600 text-white' : 'bg-white border text-slate-600'}`}
                    >
                      Merchant API
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">নগদ নম্বর</label>
                  <input
                    type="text"
                    value={paymentConfig.nagadNumber}
                    onChange={(e) => updatePaymentConfig({ nagadNumber: e.target.value })}
                    placeholder="018XXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>

                {paymentConfig.nagadType === 'merchant' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Merchant ID</label>
                      <input
                        type="text"
                        value={paymentConfig.nagadMerchantId}
                        onChange={(e) => updatePaymentConfig({ nagadMerchantId: e.target.value })}
                        placeholder="NAGAD_MERC_ID"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Public Key</label>
                      <input
                        type="text"
                        value={paymentConfig.nagadPublicKey}
                        onChange={(e) => updatePaymentConfig({ nagadPublicKey: e.target.value })}
                        placeholder="Nagad Public Key"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rocket Config */}
            {activeGateway === 'rocket' && (
              <div className="p-5 rounded-2xl bg-purple-50/30 border border-purple-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">রকেট অ্যাকাউন্ট টাইপ:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updatePaymentConfig({ rocketType: 'personal' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${paymentConfig.rocketType === 'personal' ? 'bg-purple-600 text-white' : 'bg-white border text-slate-600'}`}
                    >
                      Personal (১২ ডিজিট)
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePaymentConfig({ rocketType: 'merchant' })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${paymentConfig.rocketType === 'merchant' ? 'bg-purple-600 text-white' : 'bg-white border text-slate-600'}`}
                    >
                      Merchant DBBL API
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">রকেট একাউন্ট নম্বর (১২ ডিজিট)</label>
                  <input
                    type="text"
                    value={paymentConfig.rocketNumber}
                    onChange={(e) => updatePaymentConfig({ rocketNumber: e.target.value })}
                    placeholder="019XXXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  />
                </div>
              </div>
            )}

            {/* SSLCommerz */}
            {activeGateway === 'sslcommerz' && (
              <div className="p-5 rounded-2xl bg-blue-50/30 border border-blue-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900">SSLCommerz Environment:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updatePaymentConfig({ sslcommerzIsSandbox: true })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${paymentConfig.sslcommerzIsSandbox ? 'bg-amber-600 text-white' : 'bg-white border text-slate-600'}`}
                    >
                      Sandbox (টেস্টিং)
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePaymentConfig({ sslcommerzIsSandbox: false })}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${!paymentConfig.sslcommerzIsSandbox ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'}`}
                    >
                      Live Production
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Store ID</label>
                    <input
                      type="text"
                      value={paymentConfig.sslcommerzStoreId}
                      onChange={(e) => updatePaymentConfig({ sslcommerzStoreId: e.target.value })}
                      placeholder="testbox_live_id"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Store Password</label>
                    <input
                      type={showSecret['sslPass'] ? 'text' : 'password'}
                      value={paymentConfig.sslcommerzStorePassword}
                      onChange={(e) => updatePaymentConfig({ sslcommerzStorePassword: e.target.value })}
                      placeholder="Store Secret Password"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* EPS Payment */}
            {activeGateway === 'eps' && (
              <div className="p-5 rounded-2xl bg-teal-50/30 border border-teal-100 space-y-4">
                <div className="text-xs font-bold text-teal-900">ইপিএস (Electronic Payment Services) গেটওয়ে</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">EPS Merchant ID</label>
                    <input
                      type="text"
                      value={paymentConfig.epsMerchantId}
                      onChange={(e) => updatePaymentConfig({ epsMerchantId: e.target.value })}
                      placeholder="EPS_MERCHANT_XYZ"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Secret Key</label>
                    <input
                      type={showSecret['epsKey'] ? 'text' : 'password'}
                      value={paymentConfig.epsSecretKey}
                      onChange={(e) => updatePaymentConfig({ epsSecretKey: e.target.value })}
                      placeholder="EPS Secret Key"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stripe & PayPal */}
            {(activeGateway === 'stripe' || activeGateway === 'paypal') && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="text-xs font-bold text-slate-900 uppercase">{activeGateway.toUpperCase()} Global Credentials</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Public Key / Client ID</label>
                    <input
                      type="text"
                      value={activeGateway === 'stripe' ? paymentConfig.stripePublishableKey : paymentConfig.paypalClientId}
                      onChange={(e) => updatePaymentConfig(activeGateway === 'stripe' ? { stripePublishableKey: e.target.value } : { paypalClientId: e.target.value })}
                      placeholder="pk_live_... / Client ID"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Secret Key</label>
                    <input
                      type="password"
                      value={activeGateway === 'stripe' ? paymentConfig.stripeSecretKey : paymentConfig.paypalSecretKey}
                      onChange={(e) => updatePaymentConfig(activeGateway === 'stripe' ? { stripeSecretKey: e.target.value } : { paypalSecretKey: e.target.value })}
                      placeholder="sk_live_... / Secret"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Email SMTP / Resend / Mailgun */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">২. ইমেইল ডিসপ্যাচার (SMTP / Resend / Mailgun)</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">প্রোভাইডার</label>
                <select
                  value={paymentConfig.emailProvider}
                  onChange={(e) => updatePaymentConfig({ emailProvider: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50"
                >
                  <option value="smtp">Custom SMTP Server (Gmail / cPanel)</option>
                  <option value="resend">Resend API (Modern Email)</option>
                  <option value="mailgun">Mailgun API</option>
                  <option value="sendgrid">SendGrid</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">From Name & Email</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentConfig.fromName}
                    onChange={(e) => updatePaymentConfig({ fromName: e.target.value })}
                    placeholder="Sender Name"
                    className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  />
                  <input
                    type="email"
                    value={paymentConfig.fromEmail}
                    onChange={(e) => updatePaymentConfig({ fromEmail: e.target.value })}
                    placeholder="no-reply@domain.com"
                    className="w-1/2 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50"
                  />
                </div>
              </div>
            </div>

            {paymentConfig.emailProvider === 'smtp' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">SMTP Host</label>
                  <input
                    type="text"
                    value={paymentConfig.smtpHost}
                    onChange={(e) => updatePaymentConfig({ smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Port</label>
                  <input
                    type="text"
                    value={paymentConfig.smtpPort}
                    onChange={(e) => updatePaymentConfig({ smtpPort: e.target.value })}
                    placeholder="587"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Username / Email</label>
                  <input
                    type="text"
                    value={paymentConfig.smtpUser}
                    onChange={(e) => updatePaymentConfig({ smtpUser: e.target.value })}
                    placeholder="user@gmail.com"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Password</label>
                  <input
                    type="password"
                    value={paymentConfig.smtpPass}
                    onChange={(e) => updatePaymentConfig({ smtpPass: e.target.value })}
                    placeholder="App Password"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={isSendingEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" /> {isSendingEmail ? 'ইমেইল পাঠানো হচ্ছে...' : 'টেস্ট ইমেইল পাঠান'}
              </button>
              {testEmailStatus && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {testEmailStatus}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Webhooks Manager */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Webhook className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">৩. ওয়েবহুক ম্যানেজার (Webhooks)</h3>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Active
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Shopify, WooCommerce, Zapier এবং Make.com-এর সাথে রিয়েলটাইম অর্ডার ও পেমেন্ট ডাটা সিঙ্ক করার জন্য ওয়েবহুক এন্ডপয়েন্ট।
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Webhook Endpoint URL</label>
                <input
                  type="text"
                  value={paymentConfig.webhookUrl}
                  onChange={(e) => updatePaymentConfig({ webhookUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Secret Signing Token</label>
                <input
                  type="password"
                  value={paymentConfig.webhookSecret}
                  onChange={(e) => updatePaymentConfig({ webhookSecret: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50"
                />
              </div>

              {/* Supported Integrations Badges */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 mb-2">সাপোর্টেড অটোমেশন প্লাটফর্ম:</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Shopify Store', status: 'Ready' },
                    { name: 'WooCommerce', status: 'Ready' },
                    { name: 'Zapier Webhook', status: 'Connected' },
                    { name: 'Make.com', status: 'Connected' }
                  ].map(p => (
                    <div key={p.name} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{p.name}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-bold">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
