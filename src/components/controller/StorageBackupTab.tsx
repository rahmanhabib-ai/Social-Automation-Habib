import React, { useState } from 'react';
import { useSidebar } from '../../context/SidebarContext';
import { 
  HardDrive, 
  Cloud, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  Database, 
  ShieldAlert,
  Calendar,
  FileArchive
} from 'lucide-react';

export default function StorageBackupTab() {
  const { storageConfig, updateStorageConfig, exportAllConfigJSON, importAllConfigJSON } = useSidebar();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  const handleInstantBackup = () => {
    setIsBackingUp(true);
    setBackupSuccess(false);
    setTimeout(() => {
      exportAllConfigJSON();
      setIsBackingUp(false);
      setBackupSuccess(true);
      setTimeout(() => setBackupSuccess(false), 3000);
    }, 1200);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importAllConfigJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg shadow-indigo-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
            <HardDrive className="w-3.5 h-3.5" /> ক্লাউড স্টোরেজ ও অটো-ব্যাকআপ ইঞ্জিন
          </div>
          <h2 className="text-2xl font-black tracking-tight">ডাটাবেজ ও মিডিয়া ব্যাকআপ শিডিউলার</h2>
          <p className="text-blue-100 text-sm mt-1">
            AWS S3 বা Cloudflare R2 স্টোরেজ কানেক্ট করুন এবং অটোমেটেড ডাটাবেজ স্ন্যাপশট শিডিউল করুন।
          </p>
        </div>
        <div className="shrink-0">
          <button
            type="button"
            onClick={handleInstantBackup}
            disabled={isBackingUp}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            {isBackingUp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isBackingUp ? 'ব্যাকআপ তৈরি হচ্ছে...' : 'তাত্ক্ষণিক ব্যাকআপ নিন (Export)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Cloud Storage Provider */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">১. ক্লাউড অবজেক্ট স্টোরেজ (S3 / R2 / GCS)</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">স্টোরেজ প্রোভাইডার</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 's3', label: 'AWS S3' },
                    { id: 'r2', label: 'Cloudflare R2' },
                    { id: 'gcs', label: 'Google Cloud' },
                    { id: 'local', label: 'Local Server' }
                  ].map(sp => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => updateStorageConfig({ provider: sp.id as any })}
                      className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                        storageConfig.provider === sp.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Bucket Name</label>
                  <input
                    type="text"
                    value={storageConfig.bucketName}
                    onChange={(e) => updateStorageConfig({ bucketName: e.target.value })}
                    placeholder="my-company-backup-bucket"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Region / Endpoint</label>
                  <input
                    type="text"
                    value={storageConfig.region}
                    onChange={(e) => updateStorageConfig({ region: e.target.value })}
                    placeholder="ap-south-1 / https://..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Access Key ID</label>
                  <input
                    type="text"
                    value={storageConfig.accessKeyId}
                    onChange={(e) => updateStorageConfig({ accessKeyId: e.target.value })}
                    placeholder="AKIA..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Secret Access Key</label>
                  <input
                    type="password"
                    value={storageConfig.secretAccessKey}
                    onChange={(e) => updateStorageConfig({ secretAccessKey: e.target.value })}
                    placeholder="••••••••••••••••"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Automated Backup Scheduler */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">২. অটো-ব্যাকআপ শিডিউলার (Auto-Backup)</h3>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-indigo-950">স্বয়ংক্রিয় ক্লাউড ব্যাকআপ সক্রিয় করুন</div>
                  <p className="text-[11px] text-indigo-700">প্রতিদিন নির্দিষ্ট সময়ে ডাটাবেজের ফুল কপি ব্যাকআপ স্টোরেজে জমা হবে।</p>
                </div>
                <input
                  type="checkbox"
                  checked={storageConfig.autoBackupEnabled}
                  onChange={(e) => updateStorageConfig({ autoBackupEnabled: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">ব্যাকআপ ফ্রিকোয়েন্সি</label>
                  <select
                    value={storageConfig.backupFrequency}
                    onChange={(e) => updateStorageConfig({ backupFrequency: e.target.value as any })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value="daily">প্রতিদিন রাত ১২:০০ টায় (Daily)</option>
                    <option value="weekly">সাপ্তাহিক (Weekly)</option>
                    <option value="monthly">মাসিক (Monthly)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">রিটেনশন পিরিয়ড (কতদিন থাকবে)</label>
                  <select
                    value={storageConfig.retentionDays}
                    onChange={(e) => updateStorageConfig({ retentionDays: Number(e.target.value) || 30 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white"
                  >
                    <option value={7}>৭ দিন</option>
                    <option value={30}>৩০ দিন (Standard)</option>
                    <option value={90}>৯০ দিন</option>
                    <option value={365}>১ বছর</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right 5 Cols: Snapshot History & Restore */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Restore / Import Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Upload className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">ব্যাকআপ ফাইল রিস্টোর (Import / Restore)</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              পূর্বের ব্যাকআপ নেওয়া JSON ফাইলটি নির্বাচন করে পুরো সিস্টেমের সেটিংস ও ডেটা সাথে সাথে পুনরুদ্ধার করুন।
            </p>

            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl cursor-pointer bg-slate-50/50 hover:bg-emerald-50/20 transition-all text-center">
              <FileArchive className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700">JSON ব্যাকআপ ফাইল সিলেক্ট করুন</span>
              <span className="text-[10px] text-slate-400 mt-1">বা ড্র্যাগ অ্যান্ড ড্রপ করুন</span>
              <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
            </label>

            {backupSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!
              </div>
            )}
          </div>

          {/* Backup History Snapshots */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">সাম্প্রতিক ব্যাকআপ স্ন্যাপশট</h3>
              </div>
            </div>

            <div className="space-y-2.5">
              {[
                { name: 'backup_full_system_2026_09_12.json', size: '2.4 MB', date: 'আজ, ০৩:০০ AM' },
                { name: 'backup_full_system_2026_09_11.json', size: '2.3 MB', date: 'গতকাল, ০৩:০০ AM' },
                { name: 'backup_full_system_2026_09_10.json', size: '2.3 MB', date: '১০ সেপ্টেম্বর, ০৩:০০ AM' },
              ].map(snap => (
                <div key={snap.name} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-800 font-mono text-[11px] truncate max-w-[180px]">
                      {snap.name}
                    </div>
                    <div className="text-[10px] text-slate-500">{snap.date} • {snap.size}</div>
                  </div>
                  <button
                    type="button"
                    onClick={exportAllConfigJSON}
                    className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-white transition-all cursor-pointer"
                    title="ডাউনলোড করুন"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
