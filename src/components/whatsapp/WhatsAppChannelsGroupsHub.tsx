import React, { useState, useEffect, useRef } from 'react';
import SocialMediaTopNav from '../social/SocialMediaTopNav';
import {
  MessageSquare,
  Users,
  Radio,
  Plus,
  RefreshCw,
  Send,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Copy,
  Check,
  Search,
  ExternalLink,
  Sparkles,
  Layers,
  Smile,
  X,
  Play,
  Share2,
  ShieldCheck,
  Clock,
  ChevronRight,
  Filter,
  Flame,
  Zap,
  Info,
  Link,
  FileText,
  UploadCloud,
  CheckSquare,
  Square,
  PhoneCall
} from 'lucide-react';

export interface WhatsAppTarget {
  id: string;
  name: string;
  type: 'channel' | 'group';
  invite?: string;
  role?: string;
  memberCount?: number;
  category?: string;
  desc?: string;
  isFetchedFromPhone?: boolean;
  addedAt?: string;
}

export interface BroadcastLogItem {
  id: string;
  time: string;
  caption: string;
  mediaType: 'none' | 'image' | 'video';
  mediaPreview?: string;
  totalTargets: number;
  successCount: number;
  failCount: number;
  results: Array<{ targetName: string; targetType: string; status: 'sent' | 'failed'; error?: string }>;
}

const DEFAULT_CHANNELS: WhatsAppTarget[] = [
  {
    id: '120363429504227753@newsletter',
    name: 'Official Deals & Offer Channel',
    type: 'channel',
    invite: 'https://whatsapp.com/channel/0029VbDN9UXG8l57GYldRe04',
    role: 'ADMIN',
    memberCount: 1420,
    category: 'Offers & Promos',
    addedAt: new Date().toISOString()
  }
];

const DEFAULT_GROUPS: WhatsAppTarget[] = [];

const EMOJIS = ['🔥', '✨', '🛍️', '📦', '🚚', '💵', '💯', '🏷️', '🎁', '⚡', '⭐', '❤️', '👉', '✅', '💥', '🎉'];

const STORAGE_CHANNELS_KEY = 'app_wa_unlimited_channels';
const STORAGE_GROUPS_KEY = 'app_wa_unlimited_groups';
const STORAGE_LOGS_KEY = 'app_wa_broadcast_logs';

export default function WhatsAppChannelsGroupsHub() {
  const [activeTab, setActiveTab] = useState<'broadcast' | 'directory' | 'history'>('broadcast');

  // Directory State
  const [targets, setTargets] = useState<WhatsAppTarget[]>(() => {
    try {
      const savedCh = localStorage.getItem(STORAGE_CHANNELS_KEY);
      const savedGrp = localStorage.getItem(STORAGE_GROUPS_KEY);
      const chList = savedCh ? JSON.parse(savedCh) : DEFAULT_CHANNELS;
      const grpList = savedGrp ? JSON.parse(savedGrp) : DEFAULT_GROUPS;
      // Filter out stale mock sample group IDs
      const cleanedGrpList = Array.isArray(grpList) ? grpList.filter((g: any) => g.id !== '120363198273645@g.us' && g.id !== '120363283746192@g.us') : [];
      const combined = [...(Array.isArray(chList) ? chList : DEFAULT_CHANNELS), ...cleanedGrpList];
      return combined.length > 0 ? combined : [...DEFAULT_CHANNELS];
    } catch (e) {
      return [...DEFAULT_CHANNELS];
    }
  });

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);
  const [isFetchingFromPhone, setIsFetchingFromPhone] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'channel' | 'group'>('all');

  // Add Target Modal & Methods State
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMethodTab, setModalMethodTab] = useState<'link' | 'sync' | 'jid' | 'bulk'>('link');
  const [newTargetType, setNewTargetType] = useState<'channel' | 'group'>('group');
  const [newTargetName, setNewTargetName] = useState('');
  const [newTargetInput, setNewTargetInput] = useState('');
  const [newTargetCategory, setNewTargetCategory] = useState('General');
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkCategory, setBulkCategory] = useState('Bulk Import');
  const [isResolvingTarget, setIsResolvingTarget] = useState(false);
  const [resolvedPreview, setResolvedPreview] = useState<any | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Broadcast Composer State
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'none' | 'image' | 'video'>('none');
  const [mediaFileName, setMediaFileName] = useState('');
  const [antiBanDelay, setAntiBanDelay] = useState<number>(1.5);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Broadcast Running Engine State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastProgress, setBroadcastProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
    currentName: string;
    logs: string[];
  }>({ current: 0, total: 0, percentage: 0, currentName: '', logs: [] });

  const [lastBroadcastSummary, setLastBroadcastSummary] = useState<any | null>(null);
  const [broadcastLogs, setBroadcastLogs] = useState<BroadcastLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOGS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Member Extractor Modal State
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractingTarget, setExtractingTarget] = useState<WhatsAppTarget | null>(null);
  const [extractedMembers, setExtractedMembers] = useState<Array<{ jid: string; phone: string; rawPhone: string; isAdmin: boolean; admin: string | null }>>([]);
  const [isExtractingMembers, setIsExtractingMembers] = useState(false);
  const [copiedPhoneList, setCopiedPhoneList] = useState(false);

  const handleExtractGroupMembers = async (target: WhatsAppTarget) => {
    if (target.type === 'channel') {
      alert('🔒 WhatsApp Channel Privacy Policy অনুযায়ী চ্যানেল সদস্যদের ফোন নম্বর এন্ড-টু-এন্ড এনক্রিপশন ও প্রাইভেসির কারণে মেটা (WhatsApp) কোনো এপিআই বা বটকে স্ক্র্যাপ করতে দেয় না। শুধুমাত্র অ্যাডমিনদের তথ্য দেখা যায়।\n\nগ্রুপের সকল সদস্যদের ফোন নম্বর আপনি তাৎক্ষণিকভাবে এক্সট্রাক্ট ও এক্সপোর্ট করতে পারবেন।');
      return;
    }

    setExtractingTarget(target);
    setIsExtractingMembers(true);
    setExtractedMembers([]);

    try {
      const res = await fetch('/api/whatsapp/extract-group-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: target.id })
      });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.members)) {
        setExtractedMembers(data.members);
      } else {
        alert(data.error || 'সদস্যদের তালিকা এক্সট্রাক্ট করতে সমস্যা হয়েছে। নিশ্চিত করুন আপনি এই গ্রুপের মেম্বার।');
      }
    } catch (err: any) {
      alert(`এক্সট্রাক্ট এরর: ${err.message}`);
    } finally {
      setIsExtractingMembers(false);
    }
  };

  const copyExtractedNumbers = () => {
    const numbers = extractedMembers.map(m => m.phone || m.rawPhone).filter(Boolean).join('\n');
    navigator.clipboard.writeText(numbers);
    setCopiedPhoneList(true);
    setTimeout(() => setCopiedPhoneList(false), 2500);
  };

  // Persist directory changes
  useEffect(() => {
    try {
      const channels = targets.filter(t => t.type === 'channel');
      const groups = targets.filter(t => t.type === 'group');
      localStorage.setItem(STORAGE_CHANNELS_KEY, JSON.stringify(channels));
      localStorage.setItem(STORAGE_GROUPS_KEY, JSON.stringify(groups));
    } catch (e) {}
  }, [targets]);

  // Persist logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(broadcastLogs.slice(0, 50)));
    } catch (e) {}
  }, [broadcastLogs]);

  // Load server targets on mount
  const loadServerTargets = async () => {
    try {
      const res = await fetch('/api/whatsapp/targets');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.targets) && data.targets.length > 0) {
          setTargets(prev => {
            const map = new Map<string, WhatsAppTarget>();
            // Keep existing
            prev.forEach(t => map.set(t.id, t));
            // Add or update from server
            data.targets.forEach((t: any) => {
              if (t.id) {
                map.set(t.id, {
                  id: t.id,
                  name: t.name || 'WhatsApp Target',
                  type: t.type === 'channel' ? 'channel' : 'group',
                  invite: t.invite || '',
                  role: t.role || 'ADMIN',
                  memberCount: t.memberCount || 0,
                  category: t.category || (t.type === 'channel' ? 'Channels' : 'Groups'),
                  addedAt: t.addedAt || new Date().toISOString(),
                  isFetchedFromPhone: !!t.isFetchedFromPhone
                });
              }
            });
            return Array.from(map.values());
          });
        }
      }
    } catch (e) {}
  };

  // Check Baileys live status & auto sync
  useEffect(() => {
    loadServerTargets();

    const checkStatus = async () => {
      try {
        const res = await fetch('/api/whatsapp/status');
        if (!res.ok) return;
        const data = await res.json();
        const prevStatus = connectionStatus;
        setConnectionStatus(data.status || 'disconnected');
        setConnectedPhone(data.phone || null);

        // If newly connected, auto sync phone groups silently
        if (data.status === 'connected' && prevStatus !== 'connected') {
          handleFetchAllFromPhone(true);
        }
      } catch (err) {}
    };

    checkStatus();
    const interval = setInterval(checkStatus, 4000);
    return () => clearInterval(interval);
  }, [connectionStatus]);

  // Auto detect target type when inputting link
  useEffect(() => {
    if (newTargetInput) {
      const trimmed = newTargetInput.trim().toLowerCase();
      if (trimmed.includes('whatsapp.com/channel/') || trimmed.endsWith('@newsletter')) {
        setNewTargetType('channel');
      } else if (trimmed.includes('chat.whatsapp.com/') || trimmed.endsWith('@g.us')) {
        setNewTargetType('group');
      }
    }
  }, [newTargetInput]);

  // Fetch all live WhatsApp Groups & Channels directly from the connected phone
  const handleFetchAllFromPhone = async (silent = false) => {
    setIsFetchingFromPhone(true);
    let addedCount = 0;
    try {
      // 1. Fetch Groups
      const grpRes = await fetch('/api/whatsapp/groups');
      const grpData = await grpRes.json();
      const phoneGroups: WhatsAppTarget[] = [];
      if (grpData.success && Array.isArray(grpData.groups)) {
        grpData.groups.forEach((g: any) => {
          phoneGroups.push({
            id: g.id,
            name: g.name || 'WhatsApp Group',
            type: 'group',
            invite: g.invite || '',
            memberCount: g.memberCount || 0,
            desc: g.desc || '',
            category: 'Phone Groups',
            isFetchedFromPhone: true,
            addedAt: new Date().toISOString()
          });
        });
      }

      // 2. Fetch Channels (Newsletters)
      const chRes = await fetch('/api/whatsapp/channels');
      const chData = await chRes.json();
      const phoneChannels: WhatsAppTarget[] = [];
      if (chData.success && Array.isArray(chData.channels)) {
        chData.channels.forEach((c: any) => {
          phoneChannels.push({
            id: c.id,
            name: c.name || 'WhatsApp Channel',
            type: 'channel',
            invite: c.invite || '',
            role: c.role || 'ADMIN',
            memberCount: c.subscribers || 0,
            category: 'Phone Channels',
            isFetchedFromPhone: true,
            addedAt: new Date().toISOString()
          });
        });
      }

      setTargets(prev => {
        const map = new Map<string, WhatsAppTarget>();
        prev.forEach(p => map.set(p.id, p));

        [...phoneGroups, ...phoneChannels].forEach(item => {
          if (!map.has(item.id)) {
            addedCount++;
          }
          map.set(item.id, item);
        });

        return Array.from(map.values());
      });

      const msg = `✅ ফোন থেকে সফলভাবে ${phoneGroups.length} টি গ্রুপ এবং ${phoneChannels.length} টি চ্যানেল সিঙ্ক হয়েছে!`;
      setSyncFeedback(msg);
      setTimeout(() => setSyncFeedback(null), 5000);

      if (!silent) {
        // Feedback
      }
    } catch (err: any) {
      if (!silent) {
        setSyncFeedback(`⚠️ ফোন থেকে সিঙ্ক করতে সমস্যা হয়েছে: ${err.message}`);
        setTimeout(() => setSyncFeedback(null), 6000);
      }
    } finally {
      setIsFetchingFromPhone(false);
    }
  };

  // Preview / Resolve Target Link or JID
  const handleResolvePreview = async () => {
    if (!newTargetInput.trim()) return;
    setIsResolvingTarget(true);
    setResolvedPreview(null);

    try {
      if (newTargetType === 'channel') {
        const res = await fetch('/api/whatsapp/channel-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelInput: newTargetInput })
        });
        const data = await res.json();
        if (data.success && data.channel) {
          setResolvedPreview({
            id: data.channel.jid || newTargetInput,
            name: data.channel.name || 'WhatsApp Channel',
            type: 'channel',
            role: data.channel.role || 'ADMIN',
            memberCount: data.channel.subscribers || 0,
            resolved: data.channel.resolved
          });
          if (!newTargetName && data.channel.name) {
            setNewTargetName(data.channel.name);
          }
        }
      } else {
        const res = await fetch('/api/whatsapp/group-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupInput: newTargetInput })
        });
        const data = await res.json();
        if (data.success && data.group) {
          setResolvedPreview({
            id: data.group.id || newTargetInput,
            name: data.group.name || 'WhatsApp Group',
            type: 'group',
            memberCount: data.group.memberCount || 0,
            resolved: data.group.resolved
          });
          if (!newTargetName && data.group.name) {
            setNewTargetName(data.group.name);
          }
        }
      }
    } catch (e) {
    } finally {
      setIsResolvingTarget(false);
    }
  };

  // Resolve & Add Single Target
  const handleAddTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTargetInput.trim()) {
      alert('অনুগ্রহ করে চ্যানেলের বা গ্রুপের ইনভাইট লিংক অথবা JID প্রদান করুন।');
      return;
    }

    setIsResolvingTarget(true);
    let resolvedId = newTargetInput.trim();
    let resolvedName = newTargetName.trim() || (newTargetType === 'channel' ? 'New WhatsApp Channel' : 'New WhatsApp Group');
    let resolvedRole = 'ADMIN';
    let resolvedMembers = 0;

    try {
      if (resolvedPreview) {
        resolvedId = resolvedPreview.id || resolvedId;
        if (!newTargetName.trim() && resolvedPreview.name) {
          resolvedName = resolvedPreview.name;
        }
        resolvedRole = resolvedPreview.role || resolvedRole;
        resolvedMembers = resolvedPreview.memberCount || resolvedMembers;
      } else if (newTargetType === 'channel') {
        const res = await fetch('/api/whatsapp/channel-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelInput: newTargetInput })
        });
        const data = await res.json();
        if (data.success && data.channel) {
          if (data.channel.jid) resolvedId = data.channel.jid;
          if (data.channel.name && !newTargetName.trim()) resolvedName = data.channel.name;
          if (data.channel.role) resolvedRole = data.channel.role;
        }
      } else {
        const res = await fetch('/api/whatsapp/group-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupInput: newTargetInput })
        });
        const data = await res.json();
        if (data.success && data.group) {
          if (data.group.id) resolvedId = data.group.id;
          if (data.group.name && !newTargetName.trim()) resolvedName = data.group.name;
          if (data.group.memberCount) resolvedMembers = data.group.memberCount;
        }
      }

      const newTarget: WhatsAppTarget = {
        id: resolvedId,
        name: resolvedName,
        type: newTargetType,
        invite: newTargetInput,
        role: resolvedRole,
        memberCount: resolvedMembers,
        category: newTargetCategory.trim() || 'General',
        addedAt: new Date().toISOString()
      };

      // Persist to server
      fetch('/api/whatsapp/save-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: newTarget })
      }).catch(() => {});

      setTargets(prev => {
        const filtered = prev.filter(t => t.id !== newTarget.id);
        return [newTarget, ...filtered];
      });

      // Auto select the newly added target for convenience
      setSelectedTargetIds(prev => Array.from(new Set([newTarget.id, ...prev])));

      // Reset form
      setNewTargetName('');
      setNewTargetInput('');
      setNewTargetCategory('General');
      setResolvedPreview(null);
      setShowAddModal(false);

      setSyncFeedback(`✅ "${newTarget.name}" সফলভাবে যুক্ত হয়েছে!`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err: any) {
      alert(`টার্গেট যোগ করতে সমস্যা হয়েছে: ${err.message}`);
    } finally {
      setIsResolvingTarget(false);
    }
  };

  // Bulk Import
  const handleBulkImport = async () => {
    if (!bulkInputText.trim()) {
      alert('অনুগ্রহ করে প্রতি লাইনে একটি করে লিংক বা আইডি পেস্ট করুন।');
      return;
    }

    const lines = bulkInputText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return;

    setIsResolvingTarget(true);
    try {
      const res = await fetch('/api/whatsapp/bulk-add-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lines,
          category: bulkCategory.trim() || 'Bulk Import'
        })
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.targets)) {
        setTargets(prev => {
          const map = new Map<string, WhatsAppTarget>();
          prev.forEach(p => map.set(p.id, p));
          data.targets.forEach((item: WhatsAppTarget) => map.set(item.id, item));
          return Array.from(map.values());
        });

        // Select all newly imported
        const newIds = data.targets.map((t: WhatsAppTarget) => t.id);
        setSelectedTargetIds(prev => Array.from(new Set([...newIds, ...prev])));

        setBulkInputText('');
        setShowAddModal(false);
        setSyncFeedback(`🎉 ${data.addedCount} টি গ্রুপ ও চ্যানেল একযোগে সফলভাবে যুক্ত করা হয়েছে!`);
        setTimeout(() => setSyncFeedback(null), 5000);
      } else {
        alert(data.error || 'বাল্ক ইমপোর্ট করতে সমস্যা হয়েছে।');
      }
    } catch (e: any) {
      alert(`ইমপোর্ট এরর: ${e.message}`);
    } finally {
      setIsResolvingTarget(false);
    }
  };

  const handleDeleteTarget = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এই টার্গেটটি তালিকা থেকে মুছে ফেলতে চান?')) {
      setTargets(prev => prev.filter(t => t.id !== id));
      setSelectedTargetIds(prev => prev.filter(tid => tid !== id));
      fetch('/api/whatsapp/delete-target', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).catch(() => {});
    }
  };

  // Media file upload handler
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 32 * 1024 * 1024) {
      alert('ফাইল সাইজ সর্বোচ্চ ৩২ মেগাবাইট পর্যন্ত হতে পারবে।');
      return;
    }

    const isVid = file.type.startsWith('video/');
    const isImg = file.type.startsWith('image/');

    if (!isVid && !isImg) {
      alert('শুধু ছবি (JPG, PNG, WebP) অথবা ভিডিও (MP4) ফাইল আপলোড করতে পারবেন।');
      return;
    }

    setMediaType(isVid ? 'video' : 'image');
    setMediaFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setMediaFile(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaType('none');
    setMediaFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Target selection toggles
  const handleToggleTarget = (id: string) => {
    setSelectedTargetIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllChannels = () => {
    const channelIds = targets.filter(t => t.type === 'channel').map(t => t.id);
    const allSelected = channelIds.every(id => selectedTargetIds.includes(id));
    if (allSelected) {
      setSelectedTargetIds(prev => prev.filter(id => !channelIds.includes(id)));
    } else {
      setSelectedTargetIds(prev => Array.from(new Set([...prev, ...channelIds])));
    }
  };

  const handleSelectAllGroups = () => {
    const groupIds = targets.filter(t => t.type === 'group').map(t => t.id);
    const allSelected = groupIds.every(id => selectedTargetIds.includes(id));
    if (allSelected) {
      setSelectedTargetIds(prev => prev.filter(id => !groupIds.includes(id)));
    } else {
      setSelectedTargetIds(prev => Array.from(new Set([...prev, ...groupIds])));
    }
  };

  const handleSelectEverything = () => {
    if (selectedTargetIds.length === targets.length) {
      setSelectedTargetIds([]);
    } else {
      setSelectedTargetIds(targets.map(t => t.id));
    }
  };

  // Execute Broadcast to all selected targets
  const handleStartBroadcast = async () => {
    if (selectedTargetIds.length === 0) {
      alert('অনুগ্রহ করে কমপক্ষে একটি চ্যানেল বা গ্রুপ নির্বাচন করুন।');
      return;
    }

    if (!caption.trim() && !mediaFile) {
      alert('বার্তা লিখুন অথবা একটি ছবি/ভিডিও নির্বাচন করুন।');
      return;
    }

    if (connectionStatus !== 'connected') {
      alert('WhatsApp গেটওয়ে সক্রিয় নয়। অনুগ্রহ করে মেসেজ গেটওয়ে থেকে QR কোড স্ক্যান করে কানেক্ট করুন।');
      return;
    }

    const selectedTargets = targets.filter(t => selectedTargetIds.includes(t.id));
    setIsBroadcasting(true);
    setLastBroadcastSummary(null);
    setBroadcastProgress({
      current: 0,
      total: selectedTargets.length,
      percentage: 0,
      currentName: selectedTargets[0]?.name || '',
      logs: [`ব্রডকাস্ট ইঞ্জিন শুরু হয়েছে: মোট ${selectedTargets.length} টি টার্গেট...`]
    });

    try {
      const res = await fetch('/api/whatsapp/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targets: selectedTargets,
          caption: caption.trim(),
          mediaUrl: mediaFile,
          mediaType: mediaType,
          delaySeconds: antiBanDelay
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const newLogItem: BroadcastLogItem = {
          id: String(Date.now()),
          time: new Date().toLocaleTimeString(),
          caption: caption.slice(0, 120),
          mediaType,
          mediaPreview: mediaFile || undefined,
          totalTargets: data.totalTargets,
          successCount: data.successfulCount,
          failCount: data.failedCount,
          results: data.results || []
        };

        setBroadcastLogs(prev => [newLogItem, ...prev]);
        setLastBroadcastSummary({
          summary: `✅ ব্রডকাস্ট সম্পন্ন! সফল: ${data.successfulCount}, ব্যর্থ: ${data.failedCount}`,
          successful: data.successfulCount,
          failed: data.failedCount,
          total: data.totalTargets
        });

        setBroadcastProgress({
          current: selectedTargets.length,
          total: selectedTargets.length,
          percentage: 100,
          currentName: 'সম্পন্ন',
          logs: [`ব্রডকাস্ট সফলভাবে সমাপ্ত হয়েছে (${data.successfulCount}/${data.totalTargets})`]
        });
      } else {
        alert(data.error || 'ব্রডকাস্ট পাঠাতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      alert(`ব্রডকাস্ট ত্রুটি: ${err.message}`);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered targets
  const filteredTargets = targets.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesType && matchesCat;
  });

  const categories = Array.from(new Set(targets.map(t => t.category).filter(Boolean))) as string[];
  const totalChannels = targets.filter(t => t.type === 'channel').length;
  const totalGroups = targets.filter(t => t.type === 'group').length;
  const selectedChannelsCount = targets.filter(t => t.type === 'channel' && selectedTargetIds.includes(t.id)).length;
  const selectedGroupsCount = targets.filter(t => t.type === 'group' && selectedTargetIds.includes(t.id)).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-2 md:p-6 pb-24">
      {/* 1. Global Social Media & WhatsApp Top Tab Navigation Bar */}
      <SocialMediaTopNav activeTab="whatsapp_channels_groups" />

      {/* Sync Feedback Toast Notification */}
      {syncFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-xl flex items-center justify-between animate-fadeIn transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{syncFeedback}</span>
          </div>
          <button onClick={() => setSyncFeedback(null)} className="p-1 hover:bg-emerald-700 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Quick Metrics */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                Unlimited Channels & Groups Hub
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                connectionStatus === 'connected' 
                  ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40' 
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
                {connectionStatus === 'connected' ? `Online (+${connectedPhone || 'Linked'})` : 'WhatsApp Offline (Demo Mode)'}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>হোয়াটসঅ্যাপ আনলিমিটেড চ্যানেল ও গ্রুপ ব্রডকাস্ট হাব</span>
            </h1>
            <p className="text-emerald-100/90 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              স্বয়ংক্রিয় সিঙ্ক, ইনভাইট লিংক অথবা JID দিয়ে শত শত চ্যানেল ও গ্রুপ যুক্ত করুন এবং এক ক্লিকে একযোগে টেক্সট বার্তা, ফটো ও ভিডিও ব্রডকাস্ট পাঠান।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleFetchAllFromPhone(false)}
              disabled={isFetchingFromPhone || connectionStatus !== 'connected'}
              title={connectionStatus !== 'connected' ? 'ফোন কানেক্ট করুন' : 'ফোন থেকে সব গ্রুপ ও চ্যানেল সিঙ্ক করুন'}
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isFetchingFromPhone ? 'animate-spin' : ''}`} />
              <span>{isFetchingFromPhone ? 'সিঙ্ক হচ্ছে...' : '🔄 ফোন থেকে অটো-সিঙ্ক'}</span>
            </button>
            <button
              onClick={() => { setModalMethodTab('link'); setShowAddModal(true); }}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 font-black text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>+ গ্রুপ বা চ্যানেল যোগ করুন</span>
            </button>
            <button
              onClick={() => { setModalMethodTab('bulk'); setShowAddModal(true); }}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-teal-300" />
              <span>📋 বাল্ক ইমপোর্ট</span>
            </button>
          </div>
        </div>

        {/* Counter Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-emerald-700/50">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-emerald-200/80 font-semibold">মোট চ্যানেল (Channels)</div>
            <div className="text-xl font-black text-white mt-0.5">{totalChannels} টি</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-teal-200/80 font-semibold">মোট গ্রুপ (Groups)</div>
            <div className="text-xl font-black text-white mt-0.5">{totalGroups} টি</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-amber-200/80 font-semibold">নির্বাচিত টার্গেট (Selected)</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">
              {selectedTargetIds.length} টি ({selectedChannelsCount} চ্যানেল, {selectedGroupsCount} গ্রুপ)
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <div className="text-[11px] text-indigo-200/80 font-semibold">ব্রডকাস্ট ক্যাম্পেইন (Sent)</div>
            <div className="text-xl font-black text-white mt-0.5">{broadcastLogs.length} টি</div>
          </div>
        </div>
      </div>

      {/* Explanatory Workflow Guide Card */}
      <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 text-indigo-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wide">
              গ্রুপ ও চ্যানেল যোগ করার সহজ মাধ্যম (How to Add Groups & Channels):
            </h4>
            <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
              <strong>১. অটো-সিঙ্ক:</strong> ফোন কানেক্ট থাকলে <em>'ফোন থেকে অটো-সিঙ্ক'</em> বাটনে চাপলে ফোনের সব গ্রুপ ও চ্যানেল একা একাই চলে আসবে।<br />
              <strong>২. লিংক দিয়ে অ্যাড:</strong> যেকোনো গ্রুপের ইনভাইট লিংক (<code className="font-mono bg-white px-1 py-0.5 rounded text-[11px]">chat.whatsapp.com/xxx</code>) বা চ্যানেল লিংক পেস্ট করলে স্বয়ংক্রিয়ভাবে তালিকায় যুক্ত হবে।<br />
              <strong>৩. সরাসরি JID:</strong> যেকোনো WhatsApp Group JID (<code className="font-mono bg-white px-1 py-0.5 rounded text-[11px]">...@g.us</code>) বা চ্যানেল আইডি দিয়ে সরাসরি যুক্ত করা যাবে।
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => { setModalMethodTab('link'); setShowAddModal(true); }}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            🔗 লিংক পেস্ট করুন
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'broadcast'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>১. ইউনিফাইড ব্রডকাস্ট কম্পোজার (Broadcast Studio)</span>
          {selectedTargetIds.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-white text-emerald-700 text-[10px] font-black">
              {selectedTargetIds.length} Selected
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'directory'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>২. চ্যানেল ও গ্রুপ ডিরেক্টরি ({targets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>৩. ব্রডকাস্ট হিস্ট্রি ও অডিট লগ ({broadcastLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: BROADCAST COMPOSER */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Target Selector (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-600" />
                    <span>টার্গেট নির্বাচন করুন (Target Selector)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">যে গ্রুপ বা চ্যানেলে পাঠাতে চান টিক দিন</p>
                </div>
                <button
                  onClick={handleSelectEverything}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                >
                  {selectedTargetIds.length === targets.length ? 'সব বাদ দিন' : 'সব সিলেক্ট করুন'}
                </button>
              </div>

              {/* Quick Batch Select Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleSelectAllChannels}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    totalChannels > 0 && selectedChannelsCount === totalChannels
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  <span>সব চ্যানেল ({totalChannels})</span>
                  {selectedChannelsCount > 0 && (
                    <span className="bg-emerald-600 text-white rounded-full px-1.5 text-[10px]">
                      {selectedChannelsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSelectAllGroups}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    totalGroups > 0 && selectedGroupsCount === totalGroups
                      ? 'bg-teal-50 text-teal-700 border-teal-300 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-teal-600" />
                  <span>সব গ্রুপ ({totalGroups})</span>
                  {selectedGroupsCount > 0 && (
                    <span className="bg-teal-600 text-white rounded-full px-1.5 text-[10px]">
                      {selectedGroupsCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 cursor-pointer ml-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন যোগ</span>
                </button>
              </div>

              {/* Search target */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="নাম বা লিংক দিয়ে ফিল্টার করুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Target List */}
              <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100">
                {filteredTargets.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                    <p>কোনো চ্যানেল বা গ্রুপ পাওয়া যায়নি</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg cursor-pointer inline-block"
                    >
                      + নতুন গ্রুপ বা চ্যানেল যোগ করুন
                    </button>
                  </div>
                ) : (
                  filteredTargets.map(item => {
                    const isSelected = selectedTargetIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleToggleTarget(item.id)}
                        className={`pt-2 flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-emerald-50/90 border border-emerald-200 shadow-sm'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                          />
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            item.type === 'channel' ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'
                          }`}>
                            {item.type === 'channel' ? <Radio className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {item.name}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                item.type === 'channel'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}>
                                {item.type === 'channel' ? 'Channel' : 'Group'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 truncate">
                              <span>{item.category || 'General'}</span>
                              {item.memberCount ? (
                                <>
                                  <span>•</span>
                                  <span>{item.memberCount} সদস্য</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Message & Media Composer (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span>মেসেজ, ফটো ও ভিডিও কম্পোজার</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    নির্বাচিত {selectedTargetIds.length} টি টার্গেটে এক ক্লিকে ব্রডকাস্ট পাঠানো হবে
                  </p>
                </div>

                {/* Selected Badge */}
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{selectedTargetIds.length} টার্গেট সিলেক্টেড</span>
                </div>
              </div>

              {/* Message Text Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    বার্তা বা ক্যাপশন (Message / Caption)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Smile className="w-3.5 h-3.5" />
                    <span>ইমোজি যোগ করুন</span>
                  </button>
                </div>

                {/* Quick Emoji Bar */}
                {showEmojiPicker && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1.5 animate-fadeIn">
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setCaption(prev => prev + ' ' + emoji)}
                        className="w-8 h-8 rounded-lg hover:bg-white text-base flex items-center justify-center transition-all cursor-pointer"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  rows={5}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="আপনার অফার, আপডেট বা নোটিফিকেশন বার্তা লিখুন (যেমন: 🔥 বিশেষ মেগা ডিসকাউন্ট অফার শুরু হয়েছে!)..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Media Attachment Studio (Photo / Video) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>ফটো বা ভিডিও অ্যাটাচমেন্ট (Photo / Video Attachment)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">JPG, PNG বা MP4 (সর্বোচ্চ ৩২ মেগাবাইট)</span>
                </label>

                {mediaFile ? (
                  <div className="p-3 bg-slate-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {mediaType === 'video' ? (
                        <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                          <Video className="w-6 h-6" />
                        </div>
                      ) : (
                        <img
                          src={mediaFile}
                          alt="Preview"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <div className="text-xs font-bold text-slate-900 truncate max-w-xs">
                          {mediaFileName || (mediaType === 'video' ? 'ভিডিও ফাইল (MP4)' : 'ছবি ফাইল (Image)')}
                        </div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 mt-0.5">
                          {mediaType.toUpperCase()} READY
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveMedia}
                      className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp, video/mp4"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-3 text-slate-400 group-hover:text-emerald-600 transition-colors">
                      <ImageIcon className="w-6 h-6" />
                      <Video className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-700 mt-2">
                      ছবি বা MP4 ভিডিও ফাইল ড্রপ করুন অথবা সিলেক্ট করতে ক্লিক করুন
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      সবগুলো নির্বাচিত চ্যানেলে ও গ্রুপে হাই-কোয়ালিটি ভিডিও/ছবি সহ বার্তা যাবে
                    </div>
                  </div>
                )}
              </div>

              {/* Anti-Ban Delay Selector */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">স্মার্ট অ্যান্টি-ব্যান সেফটি ডিলে (Anti-Ban Safety Delay)</span>
                    <span className="text-[11px] text-slate-500">প্রতিটি চ্যানেলে/গ্রুপে পাঠানোর মাঝে স্বয়ংক্রিয় বিরতি</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 1.5, 2, 3, 5].map(delay => (
                    <button
                      key={delay}
                      type="button"
                      onClick={() => setAntiBanDelay(delay)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        antiBanDelay === delay
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {delay}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Broadcast Progress & Execution Box */}
              {isBroadcasting && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                      ব্রডকাস্ট ডেলিভারি চলছে... ({broadcastProgress.current}/{broadcastProgress.total})
                    </span>
                    <span>{broadcastProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-emerald-200/50 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${broadcastProgress.percentage}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-emerald-700 font-mono">
                    বর্তমান টার্গেট: {broadcastProgress.currentName}
                  </div>
                </div>
              )}

              {/* Last Broadcast Success Report */}
              {lastBroadcastSummary && !isBroadcasting && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{lastBroadcastSummary.summary}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    মোট টার্গেট: {lastBroadcastSummary.total} | সফল: {lastBroadcastSummary.successful} | ব্যর্থ: {lastBroadcastSummary.failed}
                  </div>
                </div>
              )}

              {/* Launch Broadcast Button */}
              <button
                type="button"
                onClick={handleStartBroadcast}
                disabled={isBroadcasting || selectedTargetIds.length === 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isBroadcasting
                    ? 'ব্রডকাস্ট লাইভ সেন্ডিং চলছে...'
                    : `একযোগে ${selectedTargetIds.length} টি টার্গেটে ব্রডকাস্ট পাঠান`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECTORY MANAGEMENT */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <span>চ্যানেল ও গ্রুপ ডিরেক্টরি (Directory Management)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                যেকোনো সংখ্যক চ্যানেল ও গ্রুপ যুক্ত করুন, ক্যাটাগরি অনুসারে সাজিয়ে রাখুন অথবা মুছে ফেলুন
              </p>
            </div>

            {/* Filters & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ নতুন টার্গেট</span>
              </button>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="সার্চ করুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e: any) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                <option value="all">সব টাইপ</option>
                <option value="channel">শুধু চ্যানেল</option>
                <option value="group">শুধু গ্রুপ</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                <option value="all">সব ক্যাটাগরি</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Directory Table / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTargets.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all bg-white flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        item.type === 'channel' ? 'bg-emerald-100 text-emerald-700' : 'bg-teal-100 text-teal-700'
                      }`}>
                        {item.type === 'channel' ? <Radio className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase mt-0.5 ${
                          item.type === 'channel' ? 'bg-emerald-100 text-emerald-800' : 'bg-teal-100 text-teal-800'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteTarget(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="ডিলিট করুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">ক্যাটাগরি:</span>
                      <span className="font-semibold text-slate-700">{item.category || 'General'}</span>
                    </div>
                    {item.memberCount ? (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">সদস্য/ফলোয়ার:</span>
                        <span className="font-semibold text-slate-700">{item.memberCount} জন</span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-400">JID:</span>
                      <span className="font-mono text-[10px] text-slate-800 truncate max-w-[140px]" title={item.id}>
                        {item.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.id, item.id)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === item.id ? 'কপি হয়েছে' : 'JID'}</span>
                  </button>

                  {item.type === 'group' && (
                    <button
                      type="button"
                      onClick={() => handleExtractGroupMembers(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="গ্রুপের সকল সদস্যদের নম্বর এক্সট্রাক্ট করুন"
                    >
                      <Users className="w-3 h-3" />
                      <span>মেম্বার এক্সট্রাক্ট</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTargetIds([item.id]);
                      setActiveTab('broadcast');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ml-auto"
                  >
                    <Send className="w-3 h-3" />
                    <span>মেসেজ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BROADCAST HISTORY & AUDIT LOGS */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <span>ব্রডকাস্ট ডেলিভারি লগস (Audit History)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">সকল পূর্ববর্তী ব্রডকাস্টের বিশদ তথ্য ও ডেলিভারি স্ট্যাটাস</p>
            </div>
            {broadcastLogs.length > 0 && (
              <button
                type="button"
                onClick={() => setBroadcastLogs([])}
                className="text-xs text-rose-600 hover:underline font-bold cursor-pointer"
              >
                হিস্ট্রি ক্লিয়ার করুন
              </button>
            )}
          </div>

          {broadcastLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              এখনো কোনো ব্রডকাস্ট হিস্ট্রি নেই। কম্পোজার থেকে আপনার প্রথম ব্রডকাস্ট পাঠান!
            </div>
          ) : (
            <div className="space-y-3">
              {broadcastLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                        {log.mediaType.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-slate-900 font-mono">{log.time}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500">টার্গেট: <strong>{log.totalTargets}</strong></span>
                      <span className="text-emerald-600 font-bold">সফল: {log.successCount}</span>
                      {log.failCount > 0 && (
                        <span className="text-rose-600 font-bold">ব্যর্থ: {log.failCount}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80">
                    {log.caption || '<em>[শুধু মিডিয়া ফাইল পাঠানো হয়েছে]</em>'}
                  </p>

                  {/* Results breakdown tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {log.results.map((res, i) => (
                      <span
                        key={i}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1 ${
                          res.status === 'sent'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {res.status === 'sent' ? '✓' : '✗'} {res.targetName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MASTER ADD TARGET MODAL (4 Easy Methods) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  <span>গ্রুপ বা চ্যানেল যোগ করার মাধ্যম</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">আপনার পছন্দের যেকোনো উপায়ে গ্রুপ বা চ্যানেল যুক্ত করুন</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 Method Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setModalMethodTab('link')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
                  modalMethodTab === 'link' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔗 ইনভাইট লিংক
              </button>
              <button
                type="button"
                onClick={() => setModalMethodTab('sync')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
                  modalMethodTab === 'sync' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔄 অটো-সিঙ্ক
              </button>
              <button
                type="button"
                onClick={() => setModalMethodTab('jid')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
                  modalMethodTab === 'jid' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🆔 সরাসরি JID
              </button>
              <button
                type="button"
                onClick={() => setModalMethodTab('bulk')}
                className={`py-2 px-1 rounded-xl text-[11px] font-bold transition-all text-center ${
                  modalMethodTab === 'bulk' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📋 বাল্ক ইমপোর্ট
              </button>
            </div>

            {/* METHOD 1: INVITE LINK */}
            {modalMethodTab === 'link' && (
              <form onSubmit={handleAddTarget} className="space-y-4">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                  গ্রুপের লিংক (যেমন: <code className="font-mono bg-white px-1 py-0.5 rounded">https://chat.whatsapp.com/ABC123xyz</code>) অথবা চ্যানেল লিংক পেস্ট করুন। সিস্টেম স্বয়ংক্রিয়ভাবে টাইপ এবং মেম্বার তথ্য রিট্রাইভ করবে।
                </div>

                {/* Target Type Selector */}
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setNewTargetType('group')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      newTargetType === 'group' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    গ্রুপ (Group)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTargetType('channel')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      newTargetType === 'channel' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    চ্যানেল (Channel)
                  </button>
                </div>

                {/* Input link */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    ইনভাইট লিংক বা URL *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={newTargetInput}
                      onChange={(e) => setNewTargetInput(e.target.value)}
                      onBlur={handleResolvePreview}
                      placeholder={
                        newTargetType === 'channel'
                          ? 'https://whatsapp.com/channel/0029VbDN9UXG8l57GYldRe04'
                          : 'https://chat.whatsapp.com/E0rW3Z8e9s...'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    {isResolvingTarget && (
                      <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>

                {/* Optional Custom Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">গ্রুপ বা চ্যানেলের নাম (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={newTargetName}
                    onChange={(e) => setNewTargetName(e.target.value)}
                    placeholder="খালি রাখলে স্বয়ংক্রিয় নাম সেট হবে..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ক্যাটাগরি বা ট্যাগ</label>
                  <input
                    type="text"
                    value={newTargetCategory}
                    onChange={(e) => setNewTargetCategory(e.target.value)}
                    placeholder="যেমন: VIP Buyers, Resellers, Offers..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Resolved Live Preview Card */}
                {resolvedPreview && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-emerald-200 space-y-1 text-xs">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{resolvedPreview.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      ID: {resolvedPreview.id}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isResolvingTarget || !newTargetInput.trim()}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>তালিকায় যুক্ত করুন</span>
                </button>
              </form>
            )}

            {/* METHOD 2: AUTO-SYNC FROM PHONE */}
            {modalMethodTab === 'sync' && (
              <div className="space-y-4">
                <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-teal-900">
                    <RefreshCw className="w-4 h-4 text-teal-600" />
                    <span>১-ক্লিকে ফোন থেকে সম্পূর্ণ সিঙ্ক</span>
                  </div>
                  <p className="leading-relaxed">
                    আপনার সংযুক্ত WhatsApp অ্যাকাউন্টের সকল পার্টিসিপেটিং গ্রুপ এবং চ্যানেল স্বয়ংক্রিয়ভাবে রিট্রিভ করে এই তালিকায় যুক্ত করা হবে। আলাদা করে কোনো লিংক বা কোড দিতে হবে না।
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">গেটওয়ে স্ট্যাটাস:</span>
                  <span className={`font-black px-2 py-0.5 rounded-full text-[10px] ${
                    connectionStatus === 'connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {connectionStatus === 'connected' ? `ONLINE (+${connectedPhone || 'Linked'})` : 'OFFLINE'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleFetchAllFromPhone(false);
                    setShowAddModal(false);
                  }}
                  disabled={isFetchingFromPhone || connectionStatus !== 'connected'}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isFetchingFromPhone ? 'animate-spin' : ''}`} />
                  <span>{isFetchingFromPhone ? 'সিঙ্ক করা হচ্ছে...' : 'এখনই সকল গ্রুপ ও চ্যানেল সিঙ্ক করুন'}</span>
                </button>
              </div>
            )}

            {/* METHOD 3: DIRECT JID */}
            {modalMethodTab === 'jid' && (
              <form onSubmit={handleAddTarget} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900">WhatsApp JID ফরম্যাট:</p>
                  <p>• গ্রুপ JID: <code className="bg-white px-1 py-0.5 rounded font-mono font-bold text-indigo-700">120363291827461@g.us</code></p>
                  <p>• চ্যানেল JID: <code className="bg-white px-1 py-0.5 rounded font-mono font-bold text-emerald-700">120363429504227753@newsletter</code></p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">WhatsApp JID *</label>
                  <input
                    type="text"
                    required
                    value={newTargetInput}
                    onChange={(e) => setNewTargetInput(e.target.value)}
                    placeholder="120363xxx@g.us বা 120363xxx@newsletter"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">গ্রুপ/চ্যানেলের নাম</label>
                  <input
                    type="text"
                    value={newTargetName}
                    onChange={(e) => setNewTargetName(e.target.value)}
                    placeholder="যেমন: VIP Resellers Group"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newTargetInput.trim()}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>JID সেভ করুন</span>
                </button>
              </form>
            )}

            {/* METHOD 4: BULK IMPORT */}
            {modalMethodTab === 'bulk' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
                  প্রতি লাইনে একটি করে ইনভাইট লিংক অথবা JID পেস্ট করুন। একসাথে যত খুশি গ্রুপ ও চ্যানেল এক ক্লিকে যুক্ত করা যাবে।
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">লিংক বা JID এর তালিকা (প্রতি লাইনে ১টি)</label>
                  <textarea
                    rows={6}
                    value={bulkInputText}
                    onChange={(e) => setBulkInputText(e.target.value)}
                    placeholder={'https://chat.whatsapp.com/ABC123\nhttps://whatsapp.com/channel/0029Vbxxx\n120363198273645@g.us\n120363283746192@g.us'}
                    className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">ডিফল্ট ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    placeholder="যেমন: Wholesale Network"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleBulkImport}
                  disabled={isResolvingTarget || !bulkInputText.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-700 hover:to-indigo-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isResolvingTarget ? 'ইমপোর্ট করা হচ্ছে...' : 'একসাথে সবগুলো অ্যাড করুন'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: MEMBER EXTRACTOR & EXPORT */}
      {extractingTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                    {extractingTarget.name}
                  </h3>
                  <p className="text-xs text-slate-500">গ্রুপ মেম্বার তালিকা ও ফোন নম্বর এক্সট্রাক্টর</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExtractingTarget(null);
                  setExtractedMembers([]);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isExtractingMembers ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-xs font-bold text-slate-700">হোয়াটসঅ্যাপ থেকে মেম্বারদের নম্বর আনা হচ্ছে...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-950">মোট মেম্বার:</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white font-black">{extractedMembers.length} জন</span>
                  </div>
                  {extractedMembers.length > 0 && (
                    <button
                      type="button"
                      onClick={copyExtractedNumbers}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      {copiedPhoneList ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPhoneList ? 'কপি সম্পন্ন!' : 'সব নম্বর কপি করুন'}</span>
                    </button>
                  )}
                </div>

                {/* List container */}
                <div className="overflow-y-auto space-y-1.5 max-h-72 pr-1 divide-y divide-slate-100">
                  {extractedMembers.length === 0 ? (
                    <p className="text-xs text-center text-slate-500 py-8">কোনো সদস্য পাওয়া যায়নি বা সেশন ডিসকানেক্টেড।</p>
                  ) : (
                    extractedMembers.map((member, idx) => (
                      <div key={member.jid || idx} className="pt-2 pb-1.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400 w-5">{idx + 1}.</span>
                          <span className="font-mono font-bold text-slate-800">{member.phone}</span>
                        </div>
                        {member.isAdmin && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            {member.admin === 'superadmin' ? 'Group Creator' : 'Admin'}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>💡 যেকোনো ক্যাম্পেইনে এই নম্বরগুলোতে সরাসরি মেসেজ পাঠাতে পারবেন।</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
