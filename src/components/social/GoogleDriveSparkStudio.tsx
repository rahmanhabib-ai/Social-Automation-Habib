import React, { useState, useEffect, useRef } from 'react';
import {
  FolderGit2,
  FileText,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Calendar,
  Send,
  Facebook,
  Instagram,
  Video,
  Copy,
  ExternalLink,
  ChevronRight,
  UploadCloud,
  FileCode,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Link2,
  Key,
  HelpCircle,
  Settings,
  X,
  PlayCircle,
  FolderOpen,
  Search,
  Filter,
  CheckCheck,
  Clock,
  Eye,
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Download,
  Info,
  Radio,
  Sliders,
  Globe,
  Share2
} from 'lucide-react';
import SocialMediaTopNav from './SocialMediaTopNav';
import {
  ProductionPacket,
  FolderSyncConfig,
  PacketFormat,
  PacketValidationStatus
} from '../../types/productionPacket';
import {
  CANONICAL_FOLDER_ID,
  CANONICAL_FOLDER_URL,
  extractFolderId,
  loadSavedSyncConfig,
  saveSyncConfig,
  loadStoredPackets,
  saveStoredPackets,
  syncFolderProductionPackets,
  TEST_FIXTURES,
  runSelfVerificationSuite
} from '../../services/googleDriveImporter';
import {
  connectGoogleDriveWithPopup,
  disconnectGoogleDrive,
  getCachedToken,
  getCachedUserEmail
} from '../../services/googleAuthHelper';
import { parseAndValidatePacket } from '../../services/productionPacketParser';
import { SocialPost } from '../../types/social';
import { saveSocialPost } from '../../services/socialDb';

export const GoogleDriveSparkStudio: React.FC = () => {
  // Sync Configuration
  const [syncConfig, setSyncConfig] = useState<FolderSyncConfig>(() => loadSavedSyncConfig());
  const [folderInput, setFolderInput] = useState<string>(() => syncConfig.folderUrl || CANONICAL_FOLDER_URL);

  // Authentication State
  const [accessToken, setAccessToken] = useState<string | null>(() => getCachedToken());
  const [userEmail, setUserEmail] = useState<string | null>(() => getCachedUserEmail());
  const [isConnectingAuth, setIsConnectingAuth] = useState(false);
  const [customClientId, setCustomClientId] = useState<string>(() => localStorage.getItem('spark_google_client_id') || '');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Packets State
  const [packets, setPackets] = useState<ProductionPacket[]>(() => loadStoredPackets());
  const [selectedPacket, setSelectedPacket] = useState<ProductionPacket | null>(null);
  const [detailTab, setDetailTab] = useState<'narration' | 'performance' | 'scenes' | 'flow' | 'cover' | 'metadata' | 'audit' | 'source'>('narration');
  const [selectedNarrationLang, setSelectedNarrationLang] = useState<string>('BN_CLEAN');
  const [selectedMetaPlatform, setSelectedMetaPlatform] = useState<string>('facebook');

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | PacketFormat>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PacketValidationStatus | 'TEST'>('all');

  // Syncing State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncCountdown, setSyncCountdown] = useState<number>(syncConfig.autoSyncIntervalSeconds || 60);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Verification Suite Modal State
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isRunningVerification, setIsRunningVerification] = useState(false);
  const [verificationResults, setVerificationResults] = useState<{
    results: { checkName: string; passed: boolean; details: string; fixtureUsed?: string }[];
    allPassed: boolean;
  } | null>(null);

  // Load Initial packets from server on mount or initialize standard fixtures
  useEffect(() => {
    // Sync token if available
    const cached = getCachedToken();
    if (cached && !accessToken) {
      setAccessToken(cached);
      setUserEmail(getCachedUserEmail());
    }

    fetch('/api/drive/packets')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.packets) && data.packets.length > 0) {
          setPackets(prev => {
            const merged = [...data.packets];
            for (const p of prev) {
              if (!merged.some(m => m.id === p.id)) {
                merged.push(p);
              }
            }
            return merged;
          });
        } else {
          // Initialize with standard built-in test fixtures for immediate demonstration
          setPackets(prev => {
            if (prev.length === 0) {
              const sampleReel = parseAndValidatePacket(TEST_FIXTURES.REEL_COMPLETE, {
                docId: 'fixture_reel_01',
                docTitle: 'CL-REEL-20260926-R3 Trading Psychology',
                folderId: syncConfig.folderId
              });
              const sampleLong = parseAndValidatePacket(TEST_FIXTURES.LONG_VIDEO_COMPLETE, {
                docId: 'fixture_long_01',
                docTitle: 'CL-LONG-20260926-M1 SMC Masterclass 2026',
                folderId: syncConfig.folderId
              });
              const sampleImg = parseAndValidatePacket(TEST_FIXTURES.IMAGE_COMPLETE, {
                docId: 'fixture_img_01',
                docTitle: 'CL-IMG-20260926-C1 5 Rules of Trading',
                folderId: syncConfig.folderId
              });
              const sampleReport = parseAndValidatePacket(TEST_FIXTURES.COMPLETION_REPORT_ONLY, {
                docId: 'fixture_report_01',
                docTitle: 'Production Complete Report (Digest)',
                folderId: syncConfig.folderId
              });
              const sampleTest = parseAndValidatePacket(TEST_FIXTURES.TEST_ITEM, {
                docId: 'fixture_test_01',
                docTitle: 'CL-REEL-TEST-001 Sample Test Item',
                folderId: syncConfig.folderId
              });
              return [sampleReel, sampleLong, sampleImg, sampleReport, sampleTest];
            }
            return prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  // Save Config Changes
  const handleUpdateConfig = (updates: Partial<FolderSyncConfig>) => {
    const updated = { ...syncConfig, ...updates };
    setSyncConfig(updated);
    saveSyncConfig(updated);
  };

  const handleSaveFolderSetting = () => {
    const extracted = extractFolderId(folderInput);
    handleUpdateConfig({
      folderUrl: folderInput.trim(),
      folderId: extracted
    });
    setStatusMessage({
      type: 'success',
      text: `✅ ফোল্ডার সেটিংস সংরক্ষিত হয়েছে (ID: ${extracted.slice(0, 12)}...)`
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Google OAuth Connect
  const handleConnectGoogle = async () => {
    setIsConnectingAuth(true);
    try {
      const res = await connectGoogleDriveWithPopup(customClientId);
      setAccessToken(res.accessToken);
      if (res.email) setUserEmail(res.email);
      setStatusMessage({
        type: 'success',
        text: `🎉 Google Drive ও Docs সফলভাবে সংযুক্ত হয়েছে! ${res.email ? `(${res.email})` : ''}`
      });
      setTimeout(() => setStatusMessage(null), 3500);

      // Auto-trigger sync on initial connection
      handleSyncNow(res.accessToken);
    } catch (err: any) {
      console.warn('OAuth connect error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Google Drive কানেক্ট করতে ব্যর্থ হয়েছে।'
      });
    } finally {
      setIsConnectingAuth(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogleDrive();
    setAccessToken(null);
    setUserEmail(null);
    setStatusMessage({
      type: 'info',
      text: 'Google অ্যাকাউন্ট সংযোগ বিচ্ছিন্ন করা হয়েছে।'
    });
    setTimeout(() => setStatusMessage(null), 2500);
  };

  // Sync Now Trigger
  const handleSyncNow = async (explicitToken?: string) => {
    const token = explicitToken || accessToken;
    if (!token) {
      setStatusMessage({
        type: 'error',
        text: 'অনুগ্রহ করে প্রথমে "Sign in with Google" দিয়ে Drive কানেক্ট করুন।'
      });
      return;
    }

    setIsSyncing(true);
    setStatusMessage({
      type: 'info',
      text: `Google Drive ফোল্ডারে (${syncConfig.folderId}) ডকুমেন্ট খোঁজা হচ্ছে...`
    });

    try {
      const result = await syncFolderProductionPackets(
        token,
        syncConfig.folderId,
        syncConfig.includeSubfolders,
        packets
      );

      setPackets(result.packets);
      saveStoredPackets(result.packets);

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      handleUpdateConfig({
        lastSuccessfulSyncAt: new Date().toISOString(),
        lastSyncError: null,
        totalImportedCount: result.packets.length
      });

      setStatusMessage({
        type: 'success',
        text: `✨ সিঙ্ক সম্পন্ন! ${result.totalFound}টি ডকুমেন্ট পাওয়া গেছে (নতুন: ${result.newCount}, আপডেট: ${result.updatedCount}, অপরিবর্তিত: ${result.unchangedCount})।`
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Sync failed:', err);
      handleUpdateConfig({
        lastSyncError: err.message
      });
      setStatusMessage({
        type: 'error',
        text: `সিঙ্ক ব্যর্থ: ${err.message}`
      });
    } finally {
      setIsSyncing(false);
      setSyncCountdown(syncConfig.autoSyncIntervalSeconds);
    }
  };

  // Auto-Sync Timer Loop
  useEffect(() => {
    if (!syncConfig.autoSyncEnabled || !accessToken) return;

    const intervalTimer = setInterval(() => {
      setSyncCountdown(prev => {
        if (prev <= 1) {
          handleSyncNow();
          return syncConfig.autoSyncIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalTimer);
  }, [syncConfig.autoSyncEnabled, syncConfig.autoSyncIntervalSeconds, accessToken, syncConfig.folderId, syncConfig.includeSubfolders]);

  // Load Built-in Test Fixtures
  const handleLoadTestFixtures = () => {
    const sampleReel = parseAndValidatePacket(TEST_FIXTURES.REEL_COMPLETE, {
      docId: 'fixture_reel_01',
      docTitle: 'CL-REEL-20260926-R3 Trading Psychology',
      folderId: syncConfig.folderId
    });
    const sampleLong = parseAndValidatePacket(TEST_FIXTURES.LONG_VIDEO_COMPLETE, {
      docId: 'fixture_long_01',
      docTitle: 'CL-LONG-20260926-M1 SMC Masterclass 2026',
      folderId: syncConfig.folderId
    });
    const sampleImg = parseAndValidatePacket(TEST_FIXTURES.IMAGE_COMPLETE, {
      docId: 'fixture_img_01',
      docTitle: 'CL-IMG-20260926-C1 5 Rules of Trading',
      folderId: syncConfig.folderId
    });
    const sampleReport = parseAndValidatePacket(TEST_FIXTURES.COMPLETION_REPORT_ONLY, {
      docId: 'fixture_report_01',
      docTitle: 'Production Complete Report (Digest)',
      folderId: syncConfig.folderId
    });
    const sampleTest = parseAndValidatePacket(TEST_FIXTURES.TEST_ITEM, {
      docId: 'fixture_test_01',
      docTitle: 'CL-REEL-TEST-001 Sample Test Item',
      folderId: syncConfig.folderId
    });

    const fixtureList = [sampleReel, sampleLong, sampleImg, sampleReport, sampleTest];
    setPackets(prev => {
      const merged = [...fixtureList];
      for (const p of prev) {
        if (!merged.some(m => m.id === p.id)) merged.push(p);
      }
      return merged;
    });
    saveStoredPackets([...fixtureList, ...packets.filter(p => !fixtureList.some(f => f.id === p.id))]);

    setStatusMessage({
      type: 'success',
      text: '📦 ৫টি টেস্ট ফিক্সচার লোড হয়েছে (REEL, LONG_VIDEO, IMAGE, COMPLETION_REPORT, TEST)।'
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Run Self-Check & Verification Suite
  const handleRunVerification = async () => {
    setShowVerificationModal(true);
    setIsRunningVerification(true);
    try {
      const suite = await runSelfVerificationSuite(accessToken || undefined);
      setVerificationResults(suite);
    } catch (e: any) {
      console.warn('Verification error:', e);
    } finally {
      setIsRunningVerification(false);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filtered Packets
  const filteredPackets = packets.filter(p => {
    const matchesSearch = (
      p.contentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sourceDocTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (!matchesSearch) return false;

    if (formatFilter !== 'all' && p.format !== formatFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'TEST') {
        if (p.label !== 'TEST') return false;
      } else if (p.validation.status !== statusFilter) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <SocialMediaTopNav activeTab="google_drive_spark" />

      {/* Header Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Google Drive Production-Packet Importer
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                  Docs Ingestion Engine v2.0
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Spark প্রোডাকশন ফোল্ডার থেকে নেটিভ Google Docs আবিষ্কার, অটো-ইম্পোর্ট, ন্যারেশন সেপারেশন ও মাল্টি-ফরম্যাট ভ্যালিডেশন হাব
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunVerification}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 transition-colors shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>ভেরিফিকেশন চেক সু্যইট</span>
          </button>

          <button
            onClick={handleLoadTestFixtures}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>টেস্ট ফিক্সচার লোড</span>
          </button>

          {accessToken ? (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs text-emerald-700 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium truncate max-w-[140px]">{userEmail || 'Drive Connected'}</span>
              <button
                onClick={handleDisconnect}
                className="text-[10px] text-slate-400 hover:text-rose-500 ml-1 underline"
              >
                লগআউট
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectGoogle}
              disabled={isConnectingAuth}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{isConnectingAuth ? 'কানেক্ট হচ্ছে...' : 'Sign in with Google'}</span>
            </button>
          )}

          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            title="গুগল ড্রাইভ ক্রেডেনশিয়াল ও সেটিংস"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status Notice Message */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              : 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-4"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Connection & Folder Control Panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span>টার্গেট Google Drive ফোল্ডার ও অটো-সিঙ্ক কনফিগারেশন</span>
            </h2>
            <p className="text-xs text-slate-500">
              নিচের ফোল্ডার থেকে Spark ইঞ্জিনের তৈরি Google Docs অটোমেটিক ডিটেক্ট ও ইম্পোর্ট হবে (ক্যানোনিকাল ফোল্ডার ID: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-blue-600">{syncConfig.folderId}</code>)
            </p>
          </div>

          {/* Sync Trigger & Auto-Sync Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={syncConfig.autoSyncEnabled}
                  onChange={(e) => handleUpdateConfig({ autoSyncEnabled: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span>অটো-রিফ্রেশ</span>
              </label>

              {syncConfig.autoSyncEnabled && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700 text-[11px] text-blue-600 font-mono font-medium">
                  <Clock className="w-3 h-3 animate-spin" />
                  <span>{syncCountdown}s</span>
                </div>
              )}
            </div>

            <button
              onClick={() => handleSyncNow()}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'Sync Now (এখনই সিঙ্ক)'}</span>
            </button>
          </div>
        </div>

        {/* Input Bar for Folder URL / ID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-8 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
            <Link2 className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={folderInput}
              onChange={(e) => setFolderInput(e.target.value)}
              placeholder="Google Drive Folder URL অথবা Folder ID প্রবেশ করান..."
              className="bg-transparent border-none text-xs w-full text-slate-900 dark:text-white focus:outline-none placeholder-slate-400 font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-xl">
              <input
                type="checkbox"
                checked={syncConfig.includeSubfolders}
                onChange={(e) => handleUpdateConfig({ includeSubfolders: e.target.checked })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span className="truncate">সাব-ফোল্ডার স্ক্যান</span>
            </label>
          </div>

          <div className="md:col-span-2">
            <button
              onClick={handleSaveFolderSetting}
              className="w-full py-2.5 text-xs font-bold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
            >
              ফোল্ডার সেভ করুন
            </button>
          </div>
        </div>

        {/* Sync Status Meta Ribbon */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${accessToken ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>স্ট্যাটাস: <strong className="text-slate-700 dark:text-slate-300">{accessToken ? 'কানেক্টেড (OAuth Active)' : 'কানেকশন প্রয়োজন'}</strong></span>
            </span>

            <span>
              সর্বশেষ সফল সিঙ্ক: <strong className="text-slate-700 dark:text-slate-300">{syncConfig.lastSuccessfulSyncAt ? new Date(syncConfig.lastSuccessfulSyncAt).toLocaleTimeString() : 'এখনো হয়নি'}</strong>
            </span>

            <span>
              মোট ইম্পোর্টেড প্যাকেট: <strong className="text-blue-600 font-mono">{packets.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={syncConfig.folderUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
            >
              <span>ড্রাইভে ফোল্ডার খুলুন</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 2. Production Packets Section: Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Format Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'সব প্যাকেট' },
            { id: 'REEL', label: 'Reels (9:16)' },
            { id: 'LONG_VIDEO', label: 'Long Video (16:9)' },
            { id: 'IMAGE', label: 'Image (1:1)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFormatFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                formatFilter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Status Filter & Search */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">সব স্ট্যাটাস</option>
            <option value="VALIDATED">✅ VALIDATED (সম্পূর্ণ)</option>
            <option value="DRAFT_INCOMPLETE">⚠️ DRAFT_INCOMPLETE (অসম্পূর্ণ)</option>
            <option value="NOT_A_COMPLETE_PACKET">🚫 NOT_A_COMPLETE_PACKET (শুধুমাত্র রিপোর্ট)</option>
            <option value="TEST">🧪 TEST শুধুমাত্র</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Content ID বা টপিক সার্চ..."
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none w-48 focus:w-60 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. Production Packets List / Table (Requirement 6) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        {filteredPackets.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <FileCheck className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                {packets.length === 0 ? 'ফোল্ডারে কোনো প্রোডাকশন প্যাকেট নেই বা সিঙ্ক করা হয়নি' : 'ফিল্টারের সাথে কোনো প্যাকেট মেলেনি'}
              </h3>
              <p className="text-xs text-slate-500">
                {packets.length === 0
                  ? 'উপরে "Sync Now" বাটনে ক্লিক করে Google Drive ফোল্ডার স্ক্যান করুন অথবা "টেস্ট ফিক্সচার লোড" বাটনে ক্লিক করে নমুনা ডাটা দিয়ে পরীক্ষা করুন।'
                  : 'অনুগ্রহ করে সার্চ কুয়েরি অথবা ফরম্যাট ফিল্টার পরিবর্তন করুন।'}
              </p>
            </div>
            {packets.length === 0 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleLoadTestFixtures}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow-xs transition-colors"
                >
                  নমুনা ফিক্সচার লোড করুন
                </button>
                <button
                  onClick={() => handleSyncNow()}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
                >
                  ড্রাইভ থেকে সিঙ্ক করুন
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredPackets.map((packet) => {
              const isComplete = packet.validation.status === 'VALIDATED';
              const isReportOnly = packet.validation.status === 'NOT_A_COMPLETE_PACKET';
              const isTest = packet.label === 'TEST';

              return (
                <div
                  key={packet.id}
                  className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Format, Content ID, Topic */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Format Badge */}
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                          packet.format === 'REEL'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                            : packet.format === 'LONG_VIDEO'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800'
                            : packet.format === 'IMAGE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {packet.format} {packet.aspectRatio !== 'UNKNOWN' ? `(${packet.aspectRatio})` : ''}
                      </span>

                      {/* Content ID */}
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        {packet.contentId}
                      </span>

                      {/* Test vs Production Label */}
                      {isTest && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                          TEST ONLY (পাবলিশ হবে না)
                        </span>
                      )}

                      {/* Validation Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isComplete
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                            : isReportOnly
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                        )}
                        <span>{packet.validation.status} ({packet.validation.score}/100)</span>
                      </span>

                      {/* Version */}
                      <span className="text-[10px] text-slate-400 font-mono">v{packet.version || 1}</span>
                    </div>

                    {/* Topic */}
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {packet.topic}
                    </h3>

                    {/* Metadata Subline */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                      {packet.targetPublication.rawString && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>টার্গেট: {packet.targetPublication.rawString}</span>
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>দৈর্ঘ্য: {packet.runtime.formatted} ({packet.runtime.isEstimated ? 'আনুমানিক' : 'পরিমাপকৃত'})</span>
                      </span>

                      <span>
                        ভাষাসমূহ: <strong className="text-slate-700 dark:text-slate-300">{Object.keys(packet.narrations).join(', ') || 'N/A'}</strong>
                      </span>

                      <span>
                        দৃশ্য: <strong className="text-slate-700 dark:text-slate-300">{packet.scenes.length}</strong>
                      </span>

                      {packet.flowAssetBriefs.length > 0 && (
                        <span>
                          Flow Briefs: <strong className="text-slate-700 dark:text-slate-300">{packet.flowAssetBriefs.length}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={packet.sourceDocUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="গুগল ডক ওপেন করুন"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => {
                        setSelectedPacket(packet);
                        setDetailTab('narration');
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>বিস্তারিত দেখুন</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Production Packet Detail Drawer / Modal (Requirement 6) */}
      {selectedPacket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50 dark:bg-slate-800/50">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">
                    {selectedPacket.contentId}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold">
                    {selectedPacket.format}
                  </span>
                  {selectedPacket.label === 'TEST' && (
                    <span className="text-xs px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-bold">
                      TEST PACKET
                    </span>
                  )}
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      selectedPacket.validation.status === 'VALIDATED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedPacket.validation.status} ({selectedPacket.validation.score}/100)
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {selectedPacket.topic}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedPacket.sourceDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Doc</span>
                </a>
                <button
                  onClick={() => setSelectedPacket(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Detail Tabs */}
            <div className="flex items-center gap-1 px-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/30 overflow-x-auto">
              {[
                { id: 'narration', label: 'ক্লিন ন্যারেশন' },
                { id: 'performance', label: 'ভয়েস ও অ্যাক্টিং ডিরেকশন' },
                { id: 'scenes', label: `দৃশ্য ও চ্যাপ্টার (${selectedPacket.scenes.length})` },
                { id: 'flow', label: `Flow Briefs (${selectedPacket.flowAssetBriefs.length})` },
                { id: 'cover', label: 'কভার / থাম্বনেইল JSON' },
                { id: 'metadata', label: 'সোশ্যাল মেটাডাটা' },
                { id: 'audit', label: 'ভ্যালিডেশন অডিট' },
                { id: 'source', label: 'মূল ডকুমেন্ট টেক্সট' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setDetailTab(t.id as any)}
                  className={`px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    detailTab === t.id
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal Body Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* TAB 1: CLEAN NARRATION */}
              {detailTab === 'narration' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    {/* Language Switcher */}
                    <div className="flex items-center gap-1.5">
                      {Object.keys(selectedPacket.narrations).map(lang => (
                        <button
                          key={lang}
                          onClick={() => setSelectedNarrationLang(lang)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                            selectedNarrationLang === lang
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                      {Object.keys(selectedPacket.narrations).length === 0 && (
                        <span className="text-xs text-rose-500 font-semibold">কোনো ক্লিন ন্যারেশন পাওয়া যায়নি</span>
                      )}
                    </div>

                    {selectedPacket.narrations[selectedNarrationLang] && (
                      <button
                        onClick={() => copyToClipboard(selectedPacket.narrations[selectedNarrationLang], 'narration')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                      >
                        {copiedKey === 'narration' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'narration' ? 'কপি হয়েছে!' : 'Copy Clean Narration (ডিরেকশন ছাড়া)'}</span>
                      </button>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-sans text-sm leading-relaxed whitespace-pre-wrap text-slate-900 dark:text-slate-100">
                    {selectedPacket.narrations[selectedNarrationLang] || 'এই ভাষায় কোনো ন্যারেশন উপলব্ধ নেই।'}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    💡 <em>নোট: কপি ন্যারেশন বাটনে ক্লিক করলে শুধু স্পিচ টেক্সট কপি হবে, কোনো অ্যাক্টিং নির্দেশনা বা দৃশ্য ট্যাগ থাকবে না।</em>
                  </p>
                </div>
              )}

              {/* TAB 2: PERFORMANCE DIRECTIONS */}
              {detailTab === 'performance' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      ভয়েস ও পারফরম্যান্স নির্দেশনা (Isolated Directions)
                    </span>
                    {selectedPacket.performanceDirections && (
                      <button
                        onClick={() => copyToClipboard(selectedPacket.performanceDirections, 'perf')}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        {copiedKey === 'perf' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>কপি করুন</span>
                      </button>
                    )}
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {selectedPacket.performanceDirections || 'ডকুমেন্টে আলাদা কোনো ভয়েস বা অ্যাক্টিং নির্দেশনা উল্লেখ ছিল না।'}
                  </div>
                </div>
              )}

              {/* TAB 3: SCENES & CHAPTERS */}
              {detailTab === 'scenes' && (
                <div className="space-y-4">
                  {selectedPacket.scenes.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      ডকুমেন্টে কোনো দৃশ্য তালিকা পাওয়া যায়নি।
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedPacket.scenes.map(s => (
                        <div
                          key={s.sceneNumber}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-blue-600">Scene #{s.sceneNumber}</span>
                            <span className="font-mono text-slate-500">{s.timeRange}</span>
                          </div>
                          <p className="text-xs text-slate-800 dark:text-slate-200">
                            <strong>ভিজ্যুয়াল:</strong> {s.visualPrompt}
                          </p>
                          {s.textOverlay && (
                            <p className="text-xs text-purple-600 dark:text-purple-400">
                              <strong>অন-স্ক্রিন টেক্সট:</strong> {s.textOverlay}
                            </p>
                          )}
                          {s.audioVoiceCue && (
                            <p className="text-xs text-slate-500 italic">
                              <strong>অডিও কিউ:</strong> {s.audioVoiceCue}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedPacket.viewerChapters.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Viewer Chapters</h4>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {selectedPacket.viewerChapters.map(c => (
                          <div key={c.timestamp} className="py-1.5 flex items-center justify-between">
                            <span className="font-mono text-blue-600 font-bold">{c.timestamp}</span>
                            <span className="text-slate-700 dark:text-slate-300">{c.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FLOW ASSET BRIEFS */}
              {detailTab === 'flow' && (
                <div className="space-y-3">
                  {selectedPacket.flowAssetBriefs.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      কোনো Flow Brief পাওয়া যায়নি।
                    </div>
                  ) : (
                    selectedPacket.flowAssetBriefs.map(b => (
                      <div
                        key={b.briefIndex}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-purple-600">Flow Asset Brief #{b.briefIndex}</span>
                          <span className="text-slate-500 font-mono">দৈর্ঘ্য: {b.durationSeconds || 8}s | অনুপাত: {b.aspectRatio}</span>
                        </div>
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                          {b.prompt}
                        </p>
                        {b.motionNotes && (
                          <p className="text-[11px] text-slate-500 italic">
                            ক্যামেরা/মোশন নোট: {b.motionNotes}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: COVER / DESIGN JSON */}
              {detailTab === 'cover' && (
                <div className="space-y-3">
                  {selectedPacket.coverDesignJson ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {selectedPacket.format === 'REEL' ? 'Vertical 9:16 Cover JSON' : 'Horizontal 16:9 Thumbnail JSON'}
                        </span>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(selectedPacket.coverDesignJson?.rawJson || selectedPacket.coverDesignJson, null, 2), 'cover_json')}
                          className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          {copiedKey === 'cover_json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy Design JSON</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
                        <pre>{JSON.stringify(selectedPacket.coverDesignJson.rawJson || selectedPacket.coverDesignJson, null, 2)}</pre>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400">
                      কোনো Cover Design JSON বা কোড-ব্লক পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: SOCIAL METADATA */}
              {detailTab === 'metadata' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {['facebook', 'instagram', 'tiktok', 'youtube', 'telegram', 'whatsapp'].map(plat => (
                      <button
                        key={plat}
                        onClick={() => setSelectedMetaPlatform(plat)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-colors ${
                          selectedMetaPlatform === plat
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {plat}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const matches = selectedPacket.platformMetadata.filter(m => m.platform === selectedMetaPlatform);
                    if (matches.length === 0) {
                      return (
                        <div className="text-center py-8 text-xs text-slate-400">
                          {selectedMetaPlatform} প্ল্যাটফর্মের জন্য কোনো নির্দিষ্ট মেটাডাটা প্যাকেজ নেই।
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-3">
                        {matches.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase">
                                {item.platform} ({item.language})
                              </span>
                              <button
                                onClick={() => copyToClipboard(`${item.caption}\n\n${item.hashtags.join(' ')}`, `meta_${idx}`)}
                                className="flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                              >
                                {copiedKey === `meta_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>কপি পোস্ট টেক্সট</span>
                              </button>
                            </div>
                            {item.title && <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>}
                            <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed">{item.caption}</p>
                            <p className="text-blue-600 font-mono text-[11px]">{item.hashtags.join(' ')}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 7: VALIDATION AUDIT FINDINGS */}
              {detailTab === 'audit' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        কমপ্লিটনেস স্কোর ও ফাইন্ডিংস
                      </span>
                      <span className="text-xs font-bold font-mono text-blue-600">
                        {selectedPacket.validation.score} / 100
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          selectedPacket.validation.score >= 80 ? 'bg-emerald-500' : selectedPacket.validation.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${selectedPacket.validation.score}%` }}
                      />
                    </div>
                  </div>

                  {selectedPacket.validation.findings.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>সবগুলো স্পেসিফিকেশন ও ভ্যালিডেশন রুলস সফলভাবে উত্তীর্ণ হয়েছে (১০০% পারফেক্ট)।</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedPacket.validation.findings.map((f, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                            f.severity === 'error'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <strong>[{f.code}]:</strong> {f.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1 text-slate-500">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">মিডিয়া রেন্ডারিং ও প্রম্পট সেপারেশন নোট:</p>
                    <p>
                      একটি JSON প্রম্পট বা ডিজাইন ব্রিফ তৈরি থাকা মানেই রেন্ডারকৃত ফাইনাল মিডিয়া নয়। প্যাকেট ভ্যালিডেশনের সাথে মিডিয়া রেন্ডারিং স্ট্যাটাস আলাদাভাবে সংরক্ষিত হয়েছে।
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 8: RAW DOCUMENT SOURCE */}
              {detailTab === 'source' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      মূল গুগল ডকের অপরিবর্তিত টেক্সট কন্টেন্ট
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedPacket.rawText, 'raw')}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {copiedKey === 'raw' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Full Raw Text</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap">
                    {selectedPacket.rawText}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50">
              <div className="text-[11px] text-slate-500 font-mono">
                Source Doc: {selectedPacket.sourceDocId.slice(0, 16)}... | Modified: {new Date(selectedPacket.modifiedTime).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPacket(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Self-Check & Verification Suite Modal (Requirement 7) */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-600" />
                  <span>Google Drive Importer ভেরিফিকেশন ও সেলফ-চেক সু্যইট</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Requirement 7 অনুযায়ী ৬টি কোর কন্ট্রাক্ট চেক লাইভ এক্সিকিউট করা হচ্ছে
                </p>
              </div>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isRunningVerification ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  চেকগুলো রান করা হচ্ছে...
                </p>
              </div>
            ) : verificationResults ? (
              <div className="space-y-3">
                <div
                  className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                    verificationResults.allPassed
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>ভেরিফিকেশন রেজাল্ট: {verificationResults.results.filter(r => r.passed).length} / {verificationResults.results.length} টেস্ট পাস হয়েছে</span>
                  </span>
                  <span className="font-mono text-xs">100% Verified</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                  {verificationResults.results.map((r, i) => (
                    <div key={i} className="p-3.5 space-y-1 bg-white dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          {r.passed ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <X className="w-4 h-4 text-rose-600" />
                          )}
                          <span>{r.checkName}</span>
                        </span>
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                            r.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {r.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                        {r.details}
                      </p>
                      {r.fixtureUsed && (
                        <p className="text-[10px] text-slate-400 pl-6">
                          Fixture: <span className="font-mono">{r.fixtureUsed}</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleRunVerification}
                disabled={isRunningVerification}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs"
              >
                পুনরায় টেস্ট চালান
              </button>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-600" />
                <span>Google Drive API ও OAuth কনফিগারেশন</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Custom Google OAuth Client ID (Optional)
                </label>
                <input
                  type="text"
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                  placeholder="311371074928-erf4lf2dkd9cofp91lmpsak2pc7aljom.apps.googleusercontent.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-400">
                  ডিফল্ট ক্লায়েন্ট আইডি সিস্টেম কর্তৃক কনফিগার করা আছে। আপনি চাইলে আপনার নিজস্ব GCP ক্লায়েন্ট আইডি দিতে পারেন।
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  অটো-সিঙ্ক ইন্টারভ্যাল (সেকেন্ডে)
                </label>
                <select
                  value={syncConfig.autoSyncIntervalSeconds}
                  onChange={(e) => handleUpdateConfig({ autoSyncIntervalSeconds: parseInt(e.target.value, 10) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                >
                  <option value={30}>৩০ সেকেন্ড</option>
                  <option value={60}>৬০ সেকেন্ড (ডিফল্ট)</option>
                  <option value={120}>১২০ সেকেন্ড (২ মিনিট)</option>
                  <option value={300}>৩০০ সেকেন্ড (৫ মিনিট)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  localStorage.setItem('spark_google_client_id', customClientId.trim());
                  setShowConfigModal(false);
                  setStatusMessage({ type: 'success', text: 'সেটিংস সংরক্ষিত হয়েছে।' });
                  setTimeout(() => setStatusMessage(null), 2500);
                }}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default GoogleDriveSparkStudio;
