import React from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { 
  ShieldCheck, 
  KeyRound, 
  GlobeLock, 
  History, 
  Check, 
  X, 
  UserCheck, 
  Lock,
  Smartphone
} from 'lucide-react';
import { Role } from '../../types/controller';

const ROLE_LABELS: Record<Role, { en: string; bn: string }> = {
  admin: { en: 'Super Admin', bn: 'সুপার অ্যাডমিন' },
  manager: { en: 'Manager', bn: 'ম্যানেজার' },
  assistant_manager: { en: 'Assistant Manager', bn: 'সহকারী ম্যানেজার' },
  sales_manager: { en: 'Sales Manager', bn: 'সেলস ম্যানেজার' },
  sales_team: { en: 'Sales Team', bn: 'সেলস টিম' },
  warehouse: { en: 'Warehouse', bn: 'ওয়্যারহাউস/স্টক' },
  delivery_man: { en: 'Delivery Rider', bn: 'ডেলিভারি রাইডার' },
  user: { en: 'Customer/User', bn: 'ইউজার / কাস্টমার' }
};

const ALL_ROLES: Role[] = ['admin', 'manager', 'assistant_manager', 'sales_manager', 'sales_team', 'warehouse', 'delivery_man', 'user'];

export default function SecurityRBACTab() {
  const { securityConfig, updateSecurityConfig } = useSidebar();

  const handleTogglePermission = (role: Role, action: 'view' | 'create' | 'edit' | 'delete' | 'export') => {
    const current = securityConfig.rolePermissions[role] || { view: true, create: false, edit: false, delete: false, export: false };
    const updated = {
      ...securityConfig.rolePermissions,
      [role]: {
        ...current,
        [action]: !current[action]
      }
    };
    updateSecurityConfig({ rolePermissions: updated });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-600 via-rose-700 to-indigo-800 rounded-3xl p-6 text-white shadow-lg shadow-rose-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> সিকিউরিটি, রোল ও পারমিশন কন্ট্রোল
          </div>
          <h2 className="text-2xl font-black tracking-tight">গ্র্যানুলার পারমিশন ম্যাট্রিক্স ও সিকিউরিটি শিল্ড</h2>
          <p className="text-rose-100 text-sm mt-1">
            প্রতিটি ইউজার রোলের জন্য ভিউ, ক্রিয়েট, এডিট, ডিলিট এবং এক্সপোর্ট পারমিশন নিয়ন্ত্রণ ও অডিট লগ মনিটর করুন।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: RBAC Table */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* RBAC Granular Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">১. গ্র্যানুলার রোল পারমিশন ম্যাট্রিক্স (RBAC Matrix)</h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">ইউজার রোল (Role)</th>
                    <th className="py-3 px-3 font-bold text-center">View (দেখা)</th>
                    <th className="py-3 px-3 font-bold text-center">Create (তৈরি)</th>
                    <th className="py-3 px-3 font-bold text-center">Edit (এডিট)</th>
                    <th className="py-3 px-3 font-bold text-center">Delete (ডিলিট)</th>
                    <th className="py-3 px-3 font-bold text-center">Export (ডাটা)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {ALL_ROLES.map(role => {
                    const perm = securityConfig.rolePermissions[role] || { view: false, create: false, edit: false, delete: false, export: false };
                    const isSuperAdmin = role === 'admin';

                    return (
                      <tr key={role} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{ROLE_LABELS[role].bn}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{ROLE_LABELS[role].en}</div>
                        </td>

                        {/* View */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.view}
                            disabled={isSuperAdmin}
                            onChange={() => handleTogglePermission(role, 'view')}
                            className="w-4 h-4 text-emerald-600 rounded cursor-pointer disabled:opacity-50"
                          />
                        </td>

                        {/* Create */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.create}
                            disabled={isSuperAdmin}
                            onChange={() => handleTogglePermission(role, 'create')}
                            className="w-4 h-4 text-blue-600 rounded cursor-pointer disabled:opacity-50"
                          />
                        </td>

                        {/* Edit */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.edit}
                            disabled={isSuperAdmin}
                            onChange={() => handleTogglePermission(role, 'edit')}
                            className="w-4 h-4 text-amber-600 rounded cursor-pointer disabled:opacity-50"
                          />
                        </td>

                        {/* Delete */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.delete}
                            disabled={isSuperAdmin}
                            onChange={() => handleTogglePermission(role, 'delete')}
                            className="w-4 h-4 text-rose-600 rounded cursor-pointer disabled:opacity-50"
                          />
                        </td>

                        {/* Export */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={perm.export}
                            disabled={isSuperAdmin}
                            onChange={() => handleTogglePermission(role, 'export')}
                            className="w-4 h-4 text-indigo-600 rounded cursor-pointer disabled:opacity-50"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Audit Logs */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">২. লাইভ সিকিউরিটি ও অডিট লগ (Audit Logs)</h3>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Monitoring Live
              </span>
            </div>

            <div className="space-y-3">
              {securityConfig.auditLogs.map(log => (
                <div key={log.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{log.user}</span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-mono">
                        {log.role}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      <strong>{log.action}</strong>: {log.resource}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-mono">
                    <div>{log.timestamp}</div>
                    <div className="text-slate-400">IP: {log.ip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 4 Cols: 2FA & IP Whitelist */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 2FA Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Smartphone className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm">টু-ফ্যাক্টর অথেনটিকেশন (2FA)</h3>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-950">WhatsApp 2FA OTP</span>
                <input
                  type="checkbox"
                  checked={securityConfig.requireWhatsApp2FA}
                  onChange={(e) => updateSecurityConfig({ requireWhatsApp2FA: e.target.checked })}
                  className="w-5 h-5 text-rose-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                অ্যাডমিন বা স্টাফ লগইনের সময় তাদের ব্যক্তিগত হোয়াটসঅ্যাপ নম্বরে ওটিপি কোড পাঠানো হবে।
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">সেশন টাইমআউট</label>
              <select
                value={securityConfig.sessionTimeoutMinutes}
                onChange={(e) => updateSecurityConfig({ sessionTimeoutMinutes: Number(e.target.value) || 60 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50"
              >
                <option value={15}>১৫ মিনিট (High Security)</option>
                <option value={30}>৩০ মিনিট</option>
                <option value={60}>১ ঘণ্টা (Default)</option>
                <option value={1440}>২৪ ঘণ্টা (Stay Logged In)</option>
              </select>
            </div>
          </div>

          {/* IP Whitelist & Blocker */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <GlobeLock className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">আইপি হোয়াইটলিস্ট ও ব্লকার</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">অনুমোদিত IP তালিকা (Whitelist)</label>
              <textarea
                rows={3}
                value={securityConfig.ipWhitelist}
                onChange={(e) => updateSecurityConfig({ ipWhitelist: e.target.value })}
                placeholder="127.0.0.1, 103.145.10.0/24"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-slate-50"
              />
              <span className="text-[11px] text-slate-500">কমা (,) দিয়ে আলাদা করুন</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
