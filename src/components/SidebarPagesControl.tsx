import React, { useState } from 'react';
import { 
  Layers, 
  SlidersVertical, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  LockOpen, 
  Trash2, 
  Copy,
  Settings as SettingsIcon, 
  ShieldCheck, 
  Shield,
  Save,
  RotateCcw,
  Sparkles,
  Code2,
  Cpu,
  Palette,
  Eye,
  Type,
  Activity,
  FileCode,
  Zap,
  Check,
  Link2,
  AlertCircle,
  Globe,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSidebar, Role, SectionColor, AnimationStyle, ActiveStyle, FontFamily, isSystemSection, isSystemPage } from '../context/SidebarContext';
import { getPublicLiveOrigin } from '../utils/publicUrl';
import * as Icons from 'lucide-react';

const allRoles: Role[] = ['admin', 'manager', 'assistant_manager', 'sales_manager', 'sales_team', 'warehouse', 'delivery_man', 'user'];

const ALL_COLORS: { value: SectionColor, bgClass: string, label: string }[] = [
  { value: 'slate', bgClass: 'bg-slate-500', label: 'Slate' },
  { value: 'amber', bgClass: 'bg-amber-500', label: 'Amber' },
  { value: 'orange', bgClass: 'bg-orange-500', label: 'Orange' },
  { value: 'red', bgClass: 'bg-red-500', label: 'Red' },
  { value: 'rose', bgClass: 'bg-rose-500', label: 'Rose' },
  { value: 'pink', bgClass: 'bg-pink-500', label: 'Pink' },
  { value: 'purple', bgClass: 'bg-purple-500', label: 'Purple' },
  { value: 'indigo', bgClass: 'bg-indigo-500', label: 'Indigo' },
  { value: 'blue', bgClass: 'bg-blue-500', label: 'Blue' },
  { value: 'cyan', bgClass: 'bg-cyan-500', label: 'Cyan' },
  { value: 'teal', bgClass: 'bg-teal-500', label: 'Teal' },
  { value: 'emerald', bgClass: 'bg-emerald-500', label: 'Emerald' }
];

const ANIMATION_OPTIONS: { value: AnimationStyle; label: string; desc: string }[] = [
  { value: 'none', label: 'No Animation', desc: 'Instant transition' },
  { value: 'fade', label: 'Fade In', desc: 'Smooth opacity reveal' },
  { value: 'slide-right', label: 'Slide Right', desc: 'Horizontal slide entry' },
  { value: 'slide-down', label: 'Slide Down', desc: 'Vertical drop entry' },
  { value: 'zoom', label: 'Zoom In', desc: 'Scale pop effect' },
  { value: 'bounce', label: 'Spring Bounce', desc: 'Dynamic spring effect' }
];

const ACTIVE_STYLES: { value: ActiveStyle; label: string; desc: string }[] = [
  { value: 'soft', label: 'Soft Tint', desc: 'Subtle indigo backdrop' },
  { value: 'solid', label: 'Solid Slate', desc: 'Clean shaded box' },
  { value: 'dark', label: 'Deep Dark', desc: 'Night mode accent' },
  { value: 'glass', label: 'Glassmorphism', desc: 'Translucent blur effect' },
  { value: 'outline', label: 'Outline Border', desc: 'Clean stroked boundary' }
];

const FONT_OPTIONS: { value: FontFamily; label: string }[] = [
  { value: 'font-sans', label: 'Sans Serif (Modern Inter/Hind Siliguri)' },
  { value: 'font-serif', label: 'Serif (Classic & Editorial)' },
  { value: 'font-mono', label: 'Monospace (Technical/Code)' }
];

const WIDGET_OPTIONS = [
  { id: 'default', label: 'Standard Information View', desc: 'Default hero & dynamic content' },
  { id: 'counter', label: 'Interactive Counter / Calculator', desc: 'Stateful counting engine' },
  { id: 'todo', label: 'Task Checklist & Workflow', desc: 'Interactive task tracker' },
  { id: 'notes', label: 'Persistent Notepad', desc: 'Auto-saving notes editor' },
  { id: 'metrics', label: 'KPI Metrics & Analytics Card', desc: 'Live stats preview' },
  { id: 'message_gateway', label: 'SMS & WhatsApp Gateway', desc: 'Dedicated messaging portal' },
  { id: 'custom_code', label: 'Custom Code / API Sandbox', desc: 'Run custom JS & React widgets' }
];

const ICON_OPTIONS = [
  'Activity', 'AlarmClock', 'AlertCircle', 'AlertTriangle', 'AlignLeft', 'AlignRight', 'AlignCenter', 'Anchor', 'Aperture', 'Archive', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'Award', 'BarChart', 'BarChart3', 'Battery', 'Bell', 'Bluetooth', 'Book', 'Bookmark', 'Box', 'Boxes', 'Briefcase', 'Building2', 'Calendar', 'Camera', 'Cast', 'Check', 'CheckCircle', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'Clipboard', 'Clock', 'Cloud', 'CloudRain', 'Code', 'Coffee', 'Command', 'Compass', 'Copy', 'Cpu', 'CreditCard', 'Crop', 'Cross', 'Crosshair', 'Database', 'Delete', 'Disc', 'Download', 'Droplet', 'Edit', 'Eye', 'EyeOff', 'Facebook', 'FastForward', 'Feather', 'File', 'FileText', 'Film', 'Filter', 'Flag', 'Flame', 'Folder', 'FolderPlus', 'FolderMinus', 'Gift', 'Github', 'Globe', 'Grid', 'HardDrive', 'Hash', 'Headphones', 'Heart', 'HeartPulse', 'HelpCircle', 'Hexagon', 'Home', 'Image', 'Inbox', 'Info', 'Instagram', 'Key', 'Layers', 'Layout', 'LayoutDashboard', 'LifeBuoy', 'LineChart', 'Link', 'List', 'Lock', 'LockOpen', 'LogOut', 'Mail', 'Map', 'MapPin', 'Maximize', 'Menu', 'MessageCircle', 'MessageSquare', 'Mic', 'MicOff', 'Minimize', 'Monitor', 'Moon', 'MoreHorizontal', 'MoreVertical', 'MousePointer', 'Move', 'Music', 'Navigation', 'Octagon', 'Package', 'Paperclip', 'Pause', 'PenTool', 'Percent', 'Phone', 'PhoneCall', 'PieChart', 'Pill', 'Pizza', 'Play', 'Plus', 'PlusCircle', 'Power', 'Printer', 'Radio', 'RefreshCcw', 'RefreshCw', 'Repeat', 'Rewind', 'Rocket', 'Save', 'Scissors', 'Search', 'Send', 'Server', 'Settings', 'Share', 'Share2', 'Shield', 'ShieldCheck', 'ShoppingBag', 'ShoppingCart', 'Shuffle', 'SkipBack', 'SkipForward', 'Slack', 'Slash', 'Sliders', 'Smartphone', 'Smile', 'Soup', 'Speaker', 'Sparkles', 'Star', 'Stethoscope', 'StopCircle', 'Store', 'Sun', 'Sunrise', 'Sunset', 'Tablet', 'Tag', 'Tags', 'Target', 'Terminal', 'Thermometer', 'ThumbsDown', 'ThumbsUp', 'ToggleLeft', 'ToggleRight', 'Trash', 'Trash2', 'Trello', 'TrendingDown', 'TrendingUp', 'Triangle', 'Truck', 'Tv', 'Twitch', 'Twitter', 'Type', 'Umbrella', 'Underline', 'Unlock', 'Upload', 'UploadCloud', 'User', 'UserCheck', 'UserMinus', 'UserPlus', 'Users', 'Utensils', 'UtensilsCrossed', 'Video', 'VideoOff', 'Voicemail', 'Volume', 'Volume1', 'Volume2', 'VolumeX', 'Wallet', 'Watch', 'Wifi', 'WifiOff', 'Wind', 'X', 'XCircle', 'XSquare', 'Youtube', 'Zap', 'ZapOff', 'ZoomIn', 'ZoomOut'
];

type EditingItem = { type: 'section', id: string } | { type: 'page', sectionId: string, id: string } | null;

export default function SidebarPagesControl() {
  const { 
    sections, updateSection, renameSectionId, moveSection, 
    deleteSection, duplicateSection, toggleLock, addSection, saveToCloud, isSaving,
    addChildPage, deleteChildPage, updateChildPage, renameChildPageId, moveChildPage, toggleChildLock,
    resetToDefaults
  } = useSidebar();
  
  const [editingItem, setEditingItem] = useState<EditingItem>({ type: 'section', id: 'admin_dashboard_section' });
  const [activeTab, setActiveTab] = useState<'general' | 'permissions' | 'appearance' | 'functions'>('general');
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({ admin_dashboard_section: true });
  const [iconSearch, setIconSearch] = useState('');
  const [idError, setIdError] = useState<string | null>(null);
  const [domainMode, setDomainMode] = useState<'public' | 'custom' | 'dev'>('public');
  const [customDomainInput, setCustomDomainInput] = useState('app.yourdomain.com');
  const [copiedUrlKey, setCopiedUrlKey] = useState<string | null>(null);

  const getBaseOrigin = () => {
    if (domainMode === 'custom') {
      const clean = customDomainInput.trim().replace(/^https?:\/\//, '');
      return `https://${clean || 'app.yourdomain.com'}`;
    }
    return getPublicLiveOrigin();
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrlKey(key);
    setTimeout(() => setCopiedUrlKey(null), 2500);
  };

  const toggleExpand = (id: string) => setExpandedMap(prev => ({ ...prev, [id]: prev[id] !== undefined ? !prev[id] : false }));
  const isSectionExpanded = (id: string) => expandedMap[id] !== undefined ? expandedMap[id] : true;

  const editingSection = editingItem?.type === 'section' ? sections.find(s => s.id === editingItem.id) : null;
  const editingParentSection = editingItem?.type === 'page' ? sections.find(s => s.id === editingItem.sectionId) : null;
  const editingPage = editingItem?.type === 'page' ? editingParentSection?.children.find(p => p.id === editingItem.id) : null;

  const filteredIcons = ICON_OPTIONS.filter(ic => ic.toLowerCase().includes(iconSearch.toLowerCase()));

  const handleIdChange = (newVal: string) => {
    setIdError(null);
    const sanitized = newVal.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!sanitized) {
      setIdError('আইডি ফাঁকা রাখা যাবে না (ID cannot be empty)');
      return;
    }

    if (editingItem?.type === 'section') {
      const ok = renameSectionId(editingItem.id, sanitized);
      if (ok) {
        setEditingItem({ type: 'section', id: sanitized });
      } else {
        setIdError(`'${sanitized}' আইডিটি ইতিমধ্যে অন্য সেকশনে ব্যবহৃত হচ্ছে!`);
      }
    } else if (editingItem?.type === 'page') {
      const ok = renameChildPageId(editingItem.sectionId, editingItem.id, sanitized);
      if (ok) {
        setEditingItem({ type: 'page', sectionId: editingItem.sectionId, id: sanitized });
      } else {
        setIdError(`'${sanitized}' আইডিটি ইতিমধ্যে অন্য পেজে ব্যবহৃত হচ্ছে!`);
      }
    }
  };

  const getColorClasses = (color: SectionColor) => {
    switch(color) {
      case 'amber': return 'border-amber-100 bg-amber-50/10 hover:border-amber-300 hover:bg-amber-50/20';
      case 'rose': return 'border-rose-100 bg-rose-50/5 hover:border-rose-300 hover:bg-rose-50/20';
      case 'indigo': return 'border-indigo-100 bg-indigo-50/5 hover:border-indigo-300 hover:bg-indigo-50/20';
      case 'emerald': return 'border-emerald-100 bg-emerald-50/5 hover:border-emerald-300 hover:bg-emerald-50/20';
      case 'blue': return 'border-blue-100 bg-blue-50/5 hover:border-blue-300 hover:bg-blue-50/20';
      case 'purple': return 'border-purple-100 bg-purple-50/5 hover:border-purple-300 hover:bg-purple-50/20';
      default: return 'border-gray-100 bg-gray-50/10 hover:border-gray-300 hover:bg-gray-50/20';
    }
  };

  const getLineColorClass = (color: SectionColor) => {
    switch(color) {
      case 'amber': return 'bg-amber-500';
      case 'rose': return 'bg-rose-500';
      case 'indigo': return 'bg-indigo-500';
      case 'emerald': return 'bg-emerald-500';
      case 'blue': return 'bg-blue-500';
      case 'purple': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getTextColors = (color: SectionColor) => {
    switch(color) {
      case 'amber': return 'text-amber-800';
      case 'rose': return 'text-rose-900';
      case 'indigo': return 'text-indigo-900';
      case 'emerald': return 'text-emerald-900';
      case 'blue': return 'text-blue-900';
      case 'purple': return 'text-purple-900';
      default: return 'text-gray-800';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-28">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 rounded-3xl border border-indigo-950/40 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-black tracking-widest uppercase mb-2 inline-block border border-indigo-500/30">
            NAVIGATION & MENU CONTROL
          </span>
          <h2 className="text-2xl font-black tracking-tight uppercase flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-400" />
            সাইডবার ও পেজ কন্ট্রোল সেন্টার
          </h2>
          <p className="text-xs text-indigo-200 mt-1.5 font-medium max-w-xl leading-relaxed">
            প্রতিটি পেজ ও সেকশনের জন্য টাইটেল, আইকন, রোল পারমিশন, অ্যাপিয়ারেন্স/এনিমেশন এবং নিজস্ব ফাংশনালিটি (উইজেট, নোটপ্যাড, কাউন্টার, কোড স্নsnippet) এক জায়গা থেকেই নিয়ন্ত্রণ করুন।
          </p>
        </div>
        <button 
          onClick={resetToDefaults} 
          className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-rose-950/20 cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          ফ্যাক্টরি রিসেট
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column - Navigation Tree */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <SlidersVertical className="w-4 h-4 text-indigo-500" />
                ইন্টারেক্টিভ সাইডবার ট্রি (Interactive Tree)
              </h3>
              <button onClick={addSection} className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                নতুন সেকশন যোগ করুন
              </button>
            </div>
            
            <div className="space-y-4">
              {sections.map((section, index) => {
                const SectionIcon = (Icons as any)[section.iconName] || Icons.Folder;
                const isSysSec = isSystemSection(section);
                return (
                <div key={section.id} className="space-y-2">
                  {/* Parent Section Row */}
                  <div className={`rounded-2xl border transition-all duration-300 relative overflow-hidden pl-3.5 ${getColorClasses(section.color)} ${editingItem?.type === 'section' && editingItem.id === section.id ? 'ring-2 ring-indigo-500 shadow-md' : ''}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getLineColorClass(section.color)}`}></div>
                    <div className="flex items-center justify-between p-4 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleExpand(section.id)} className="p-1 hover:bg-white/50 rounded-lg text-gray-500 cursor-pointer transition-colors">
                          <ChevronDown className={`w-4 h-4 transition-transform ${isSectionExpanded(section.id) ? '' : '-rotate-90'}`} />
                        </button>
                        <div 
                          onClick={() => setEditingItem({ type: 'section', id: section.id })}
                          className="flex items-center gap-2.5 cursor-pointer"
                        >
                          <div className={`w-7 h-7 rounded-lg bg-white/80 border border-black/5 flex items-center justify-center shrink-0 shadow-xs`}>
                            <SectionIcon className={`w-4 h-4 ${getTextColors(section.color)}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-black uppercase tracking-wider ${getTextColors(section.color)}`}>
                                {section.enLabel} ({section.bnLabel})
                              </span>
                              <span className="text-[9px] font-mono font-bold text-gray-400">ID: {section.id}</span>
                              {isSysSec && (
                                <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[8px] font-black rounded uppercase border border-indigo-200 flex items-center gap-0.5" title="সিস্টেম সেকশন ডিলিট বা ইউআরএল পরিবর্তনযোগ্য নয়">
                                  <Shield className="w-2.5 h-2.5" /> SYSTEM PROTECTED
                                </span>
                              )}
                              {section.isLocked && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[8px] font-black rounded uppercase flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" /> LOCKED
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {section.roles.map(role => (
                                <span key={role} className="px-1.5 py-0.5 bg-white/60 text-gray-600 text-[8px] font-bold rounded uppercase shadow-sm">
                                  {role}
                                </span>
                              ))}
                              {section.roles.length === 0 && (
                                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-bold rounded uppercase border border-emerald-200">Public Access</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 disabled:opacity-30 rounded cursor-pointer" title="Move Section Up">
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 disabled:opacity-30 rounded cursor-pointer" title="Move Section Down">
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-gray-300 mx-1"></div>
                        <button onClick={() => toggleLock(section.id)} className={`p-1.5 rounded-xl cursor-pointer transition-colors ${section.isLocked ? 'text-amber-600 bg-amber-100 hover:bg-amber-200' : 'text-gray-400 hover:text-amber-600 hover:bg-white/50'}`} title={section.isLocked ? "Unlock Section" : "Lock Section"}>
                          {section.isLocked ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                        </button>
                        {!isSysSec && (
                          <>
                            <button onClick={() => duplicateSection(section.id)} className="p-1.5 rounded-xl cursor-pointer text-gray-400 hover:text-indigo-600 hover:bg-white/50 transition-colors" title="Duplicate Section">
                              <Copy className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteSection(section.id)} className="p-1.5 rounded-xl cursor-pointer text-gray-400 hover:text-rose-500 hover:bg-white/50 transition-colors" title="Delete Section">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => setEditingItem({ type: 'section', id: section.id })} className={`p-1.5 rounded-xl cursor-pointer transition-colors ${editingItem?.type === 'section' && editingItem.id === section.id ? 'text-indigo-600 bg-indigo-100 ring-1 ring-indigo-400' : 'text-gray-500 hover:text-indigo-600 hover:bg-white/50'}`} title="Edit Section Details">
                          <SettingsIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Child Pages Rows */}
                  <AnimatePresence>
                    {isSectionExpanded(section.id) && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="pl-6 space-y-2 relative overflow-hidden"
                      >
                        {/* Connecting vertical line */}
                        <div className={`absolute left-[23px] top-0 bottom-8 w-px ${getLineColorClass(section.color)} opacity-20`}></div>
                        
                        {section.children?.map((page, pIndex) => {
                          const ChildIcon = (Icons as any)[page.iconName] || Icons.FileText;
                          const isEditing = editingItem?.type === 'page' && editingItem.id === page.id;
                          const isSysPage = isSystemPage(section, page);
                          
                          return (
                            <div key={page.id} className={`relative flex items-center justify-between p-3 ml-4 rounded-xl border bg-white shadow-sm transition-all ${isEditing ? 'ring-2 ring-indigo-500 border-indigo-200' : 'border-gray-100 hover:border-gray-300'}`}>
                              {/* Elbow connector */}
                              <div className={`absolute -left-4 top-1/2 w-4 h-px ${getLineColorClass(section.color)} opacity-20`}></div>
                              
                              <div 
                                onClick={() => setEditingItem({ type: 'page', sectionId: section.id, id: page.id })}
                                className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                              >
                                <div className={`w-8 h-8 rounded-lg ${getColorClasses(section.color)} flex items-center justify-center shrink-0`}>
                                  <ChildIcon className={`w-4 h-4 ${getTextColors(section.color)}`} />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-gray-700">{page.enLabel} <span className="text-gray-500 font-medium">({page.bnLabel})</span></span>
                                    <span className="text-[9px] font-mono text-gray-400">ID: {page.id}</span>
                                    {isSysPage && (
                                      <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-black rounded uppercase border border-indigo-100 flex items-center gap-0.5" title="সিস্টেম পেজ ডিলিট বা স্লাগ পরিবর্তনযোগ্য নয়">
                                        <Lock className="w-2.5 h-2.5 text-indigo-600" /> সুরক্ষিত পেজ (Protected)
                                      </span>
                                    )}
                                    {page.widgetType && page.widgetType !== 'default' && (
                                      <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-black rounded uppercase border border-indigo-100">
                                        {page.widgetType}
                                      </span>
                                    )}
                                    {page.isLocked && (
                                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[8px] font-black rounded uppercase flex items-center gap-0.5">
                                        <Lock className="w-2.5 h-2.5" />
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {page.roles?.map(role => (
                                      <span key={role} className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-bold rounded uppercase">
                                        {role}
                                      </span>
                                    ))}
                                    {(!page.roles || page.roles.length === 0) && (
                                      <span className="text-[8px] text-gray-400 italic">Inherits parent section roles</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                <button onClick={() => moveChildPage(section.id, pIndex, 'up')} disabled={pIndex === 0} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 disabled:opacity-30 rounded cursor-pointer" title="Move Up">
                                  <ChevronUp className="w-4 h-4" />
                                </button>
                                <button onClick={() => moveChildPage(section.id, pIndex, 'down')} disabled={pIndex === section.children.length - 1} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 disabled:opacity-30 rounded cursor-pointer" title="Move Down">
                                  <ChevronDown className="w-4 h-4" />
                                </button>
                                <div className="w-px h-3 bg-gray-200 mx-1"></div>
                                <button onClick={() => toggleChildLock(section.id, page.id)} className={`p-1.5 rounded-xl cursor-pointer transition-colors ${page.isLocked ? 'text-amber-600 bg-amber-100 hover:bg-amber-200' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`} title="Toggle Lock">
                                  {page.isLocked ? <Lock className="w-4 h-4" /> : <LockOpen className="w-4 h-4" />}
                                </button>
                                {!isSysPage && (
                                  <button onClick={() => deleteChildPage(section.id, page.id)} className="p-1.5 rounded-xl cursor-pointer text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors" title="Delete Page">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                                <button onClick={() => setEditingItem({ type: 'page', sectionId: section.id, id: page.id })} className={`p-1.5 rounded-xl cursor-pointer transition-colors ${isEditing ? 'text-indigo-600 bg-indigo-100 ring-1 ring-indigo-400' : 'text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`} title="Edit Page Properties">
                                  <SettingsIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {isSysSec ? (
                          <div className="ml-4 pl-4 pt-1 pb-1">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-semibold border border-slate-200/80">
                              <Lock className="w-3 h-3 text-slate-400" />
                              অ্যাডমিন প্যানেল সেকশনে নতুন পেজ যোগ করা বন্ধ রাখা হয়েছে (সিস্টেম সুরক্ষিত)
                            </div>
                          </div>
                        ) : (
                          <div className="ml-4 pl-4 pt-1">
                            <button onClick={() => addChildPage(section.id)} className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-dashed border-gray-300">
                              <Plus className="w-3.5 h-3.5" />
                              নতুন পেজ যোগ করুন
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Right Column - Comprehensive Edit Form */}
        <div className="space-y-4">
          {editingItem ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <SettingsIcon className="w-4 h-4 text-indigo-500" />
                    {editingItem.type === 'section' ? 'সেকশন এডিটর (Section)' : 'পেজ এডিটর (Page)'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {editingItem.type === 'section' ? editingSection?.enLabel : `${editingParentSection?.enLabel} / ${editingPage?.enLabel}`}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  ID: {editingItem.id}
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-4 bg-slate-100 p-1 rounded-2xl gap-1">
                <button 
                  type="button"
                  onClick={() => setActiveTab('general')} 
                  className={`py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'general' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Eye className="w-3 h-3" /> Basic
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('appearance')} 
                  className={`py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'appearance' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Palette className="w-3 h-3" /> Style
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('permissions')} 
                  className={`py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'permissions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <ShieldCheck className="w-3 h-3" /> Roles
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveTab('functions')} 
                  className={`py-1.5 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${activeTab === 'functions' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <Cpu className="w-3 h-3" /> Functions
                </button>
              </div>

              {/* TAB 1: GENERAL (Titles, Icon Selector & Search, Custom Link ID) */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                      English Title (ইংরেজি নাম)
                    </label>
                    <input 
                      type="text" 
                      value={editingItem.type === 'section' ? (editingSection?.enLabel || '') : (editingPage?.enLabel || '')} 
                      onChange={(e) => {
                        if (editingItem.type === 'section') {
                          updateSection(editingItem.id, { enLabel: e.target.value });
                        } else {
                          updateChildPage(editingItem.sectionId, editingItem.id, { enLabel: e.target.value });
                        }
                      }}
                      placeholder="e.g. Sales Report"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs outline-none focus:border-indigo-500 font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                      Bengali Title (বাংলা নাম)
                    </label>
                    <input 
                      type="text" 
                      value={editingItem.type === 'section' ? (editingSection?.bnLabel || '') : (editingPage?.bnLabel || '')} 
                      onChange={(e) => {
                        if (editingItem.type === 'section') {
                          updateSection(editingItem.id, { bnLabel: e.target.value });
                        } else {
                          updateChildPage(editingItem.sectionId, editingItem.id, { bnLabel: e.target.value });
                        }
                      }}
                      placeholder="যেমন: বিক্রয় রিপোর্ট"
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs outline-none focus:border-indigo-500 font-medium text-slate-800"
                    />
                  </div>

                  {/* Icon Selector with Search and Live Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        আইকন নির্বাচন (Icon Selection)
                      </label>
                      <span className="text-[10px] font-mono font-bold text-indigo-600">
                        {editingItem.type === 'section' ? editingSection?.iconName : editingPage?.iconName}
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="Search icons (e.g. ShoppingCart, User, Chart)..."
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="w-full p-2 mb-2 border border-slate-200 rounded-xl bg-slate-50 text-xs outline-none focus:border-indigo-500 font-medium text-slate-800"
                    />

                    <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                      {filteredIcons.map(icon => {
                        const IconComp = (Icons as any)[icon] || Icons.HelpCircle;
                        const currentIcon = editingItem.type === 'section' ? editingSection?.iconName : editingPage?.iconName;
                        const isSelected = currentIcon === icon;
                        return (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => {
                              if (editingItem.type === 'section') {
                                updateSection(editingItem.id, { iconName: icon });
                              } else {
                                updateChildPage(editingItem.sectionId, editingItem.id, { iconName: icon });
                              }
                            }}
                            title={icon}
                            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isSelected ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-100'}`}
                          >
                            <IconComp className="w-4 h-4" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* URL Slug & Unique ID Customizer */}
                  {(() => {
                    const isProtected = editingItem.type === 'section'
                      ? isSystemSection(editingSection)
                      : isSystemPage(sections.find(s => s.id === editingItem.sectionId), editingPage);

                    return (
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-1.5">
                            <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                            URL স্ল্যাগ ও ইউনিক আইডি (Unique URL Slug & ID)
                          </label>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {editingItem.type === 'section' ? 'Section Slug' : 'Page Slug'}
                          </span>
                        </div>

                        {isProtected ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-slate-400 select-none">/</span>
                              <input
                                type="text"
                                disabled={true}
                                value={editingItem.type === 'section' ? editingSection?.id : editingPage?.id}
                                className="flex-1 p-2 border border-slate-200 rounded-xl bg-slate-100 text-xs font-mono text-slate-500 font-bold outline-none cursor-not-allowed select-none shadow-xs"
                              />
                              <span className="p-2 bg-slate-200/70 rounded-xl text-slate-600" title="সিস্টেম প্রটেক্টেড (পরিবর্তনযোগ্য নয়)">
                                <Lock className="w-3.5 h-3.5" />
                              </span>
                            </div>
                            <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[10px] font-bold flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                              <span>সিস্টেম সুরক্ষিত: এই {editingItem.type === 'section' ? 'সেকশনের' : 'পেজের'} ইউআরএল বা স্লাগ পরিবর্তন করা যাবে না।</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-slate-400 select-none">/</span>
                            <input
                              type="text"
                              defaultValue={editingItem.type === 'section' ? editingSection?.id : editingPage?.id}
                              key={editingItem.type === 'section' ? editingSection?.id : editingPage?.id}
                              onBlur={(e) => handleIdChange(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleIdChange((e.target as HTMLInputElement).value);
                                }
                              }}
                              placeholder="unique-slug-id"
                              className="flex-1 p-2 border border-slate-200 rounded-xl bg-white text-xs font-mono text-indigo-700 font-bold outline-none focus:border-indigo-500 shadow-sm"
                            />
                          </div>
                        )}

                        {idError && !isProtected && (
                          <p className="text-[11px] text-rose-500 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {idError}
                          </p>
                        )}

                    {/* Live Portal URL Previews & Universal Sharing Helper */}
                    <div className="pt-3 border-t border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-indigo-600" />
                          লাইভ রাউট ইউআরএল ও শেয়ারিং (Live Route URLs)
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Universal No-403
                        </span>
                      </div>

                      {/* Domain Mode Selector */}
                      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-[11px] font-semibold">
                        <button
                          type="button"
                          onClick={() => setDomainMode('public')}
                          className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                            domainMode === 'public'
                              ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/80'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          🌐 পাবলিক শেয়ার লিংক (No 403)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDomainMode('custom')}
                          className={`py-1.5 px-2.5 rounded-lg transition-all text-center cursor-pointer ${
                            domainMode === 'custom'
                              ? 'bg-white text-indigo-700 shadow-xs font-bold border border-slate-200/80'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          🏷️ কাস্টম ডোমেইন
                        </button>
                      </div>

                      {domainMode === 'custom' && (
                        <div className="flex items-center gap-2 p-1.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                          <span className="text-slate-500 font-mono text-[11px] pl-1.5">https://</span>
                          <input
                            type="text"
                            value={customDomainInput}
                            onChange={(e) => setCustomDomainInput(e.target.value)}
                            placeholder="yourdomain.com"
                            className="flex-1 bg-white border border-indigo-200 rounded-lg px-2 py-1 text-xs font-mono font-bold text-indigo-900 outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                      
                      {editingItem.type === 'section' && editingSection && (() => {
                        const adminUrl = `${getBaseOrigin()}/admin/${editingSection.id}`;
                        const userUrl = `${getBaseOrigin()}/user/${editingSection.id}`;
                        return (
                          <div className="space-y-2 text-[11px] font-mono">
                            {/* Admin Route */}
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-slate-700 truncate">
                                  <span className="text-indigo-600 font-bold font-sans">Admin:</span>
                                  <span className="text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] truncate">
                                    {adminUrl}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(adminUrl, `sec_admin_${editingSection.id}`)}
                                    className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-sans font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    {copiedUrlKey === `sec_admin_${editingSection.id}` ? (
                                      <span className="text-emerald-600 font-bold">✓ Copied</span>
                                    ) : (
                                      'Copy Link'
                                    )}
                                  </button>
                                  <a
                                    href={adminUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <span>Open</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* User Route */}
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-slate-700 truncate">
                                  <span className="text-emerald-600 font-bold font-sans">User:</span>
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] truncate">
                                    {userUrl}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(userUrl, `sec_user_${editingSection.id}`)}
                                    className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 font-sans font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    {copiedUrlKey === `sec_user_${editingSection.id}` ? (
                                      <span className="text-emerald-600 font-bold">✓ Copied</span>
                                    ) : (
                                      'Copy Link'
                                    )}
                                  </button>
                                  <a
                                    href={userUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <span>Open</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {editingItem.type === 'page' && editingPage && editingParentSection && (() => {
                        const adminUrl = `${getBaseOrigin()}/admin/${editingPage.id}`;
                        const userUrl = `${getBaseOrigin()}/user/${editingPage.id}`;
                        return (
                          <div className="space-y-2 text-[11px] font-mono">
                            {/* Admin Route */}
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-slate-700 truncate">
                                  <span className="text-indigo-600 font-bold font-sans">Admin:</span>
                                  <span className="text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] truncate">
                                    {adminUrl}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(adminUrl, `page_admin_${editingPage.id}`)}
                                    className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 font-sans font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    {copiedUrlKey === `page_admin_${editingPage.id}` ? (
                                      <span className="text-emerald-600 font-bold">✓ Copied</span>
                                    ) : (
                                      'Copy Link'
                                    )}
                                  </button>
                                  <a
                                    href={adminUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <span>Open</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </div>

                            {/* User Route */}
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-slate-700 truncate">
                                  <span className="text-emerald-600 font-bold font-sans">User:</span>
                                  <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[11px] truncate">
                                    {userUrl}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(userUrl, `page_user_${editingPage.id}`)}
                                    className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 text-slate-700 font-sans font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    {copiedUrlKey === `page_user_${editingPage.id}` ? (
                                      <span className="text-emerald-600 font-bold">✓ Copied</span>
                                    ) : (
                                      'Copy Link'
                                    )}
                                  </button>
                                  <a
                                    href={userUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <span>Open</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* 403 Error Solution & Universal Access System */}
                      <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md border border-indigo-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                            <span className="font-bold text-xs text-white">
                              ইউনিভার্সাল লাইভ অ্যাক্সেস (No 403 Guarantee)
                            </span>
                          </div>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-400/30">
                            Public Universal
                          </span>
                        </div>

                        <div className="p-2.5 bg-white/10 backdrop-blur-xs rounded-xl border border-white/15 space-y-1.5 text-[11px]">
                          <p className="text-slate-200 leading-relaxed text-[11px]">
                            👉 <strong>কেন ব্রাউজার থেকে কপি করলে 403 আসছিল:</strong><br />
                            স্টুডিও ব্রাউজারের অ্যাড্রেস বারের ইউআরএলটিতে <code className="text-rose-300 bg-black/40 px-1 py-0.5 rounded font-mono">ais-dev</code> থাকে, যা গুগল শুধুমাত্র আপনার এই অ্যাকাউন্টে সীমাবদ্ধ রাখে।
                          </p>
                          <p className="text-emerald-300 leading-relaxed text-[11px]">
                            ✅ <strong>সমাধান:</strong><br />
                            অন্য যেকোনো ডিভাইস, মোবাইল বা ইনকগনিটো মোডে পাঠাতে উপরের <strong>"Copy Link"</strong> বাটনে ক্লিক করুন। এটি স্বয়ংক্রিয়ভাবে উন্মুক্ত <code className="text-emerald-200 bg-black/40 px-1 py-0.5 rounded font-mono">ais-pre</code> পাবলিক লিংক প্রদান করবে যা পৃথিবীর যেকোনো জায়গা থেকে সরাসরি কাজ করবে।
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 2: APPEARANCE & STYLING (Color Palette, Animation Effects, Font Families, Active Styles) */}
              {activeTab === 'appearance' && (
                <div className="space-y-4">
                  {/* Section Color Palette */}
                  {editingItem.type === 'section' && editingSection && (
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                        সেকশন থিম কালার (Section Color Palette)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {ALL_COLORS.map(c => (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => updateSection(editingSection.id, { color: c.value })}
                            className={`p-2 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${editingSection.color === c.value ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-500' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full ${c.bgClass}`} />
                            <span className="text-[11px] font-semibold">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Animation Style Selector */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                      এন্ট্রি এনিমেশন স্টাইল (Animation Motion Effect)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ANIMATION_OPTIONS.map(anim => {
                        const currentAnim = editingItem.type === 'section' 
                          ? (editingSection?.animationStyle || 'slide-right')
                          : (editingPage?.animationStyle || editingParentSection?.animationStyle || 'slide-right');
                        const isSelected = currentAnim === anim.value;

                        return (
                          <button
                            key={anim.value}
                            type="button"
                            onClick={() => {
                              if (editingItem.type === 'section') {
                                updateSection(editingItem.id, { animationStyle: anim.value });
                              } else {
                                updateChildPage(editingItem.sectionId, editingItem.id, { animationStyle: anim.value });
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${isSelected ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                          >
                            <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                              {anim.label}
                              {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{anim.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Highlight Style (For Sections) */}
                  {editingItem.type === 'section' && editingSection && (
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                        এক্টিভ হাইলাইট স্টাইল (Active Container Style)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {ACTIVE_STYLES.map(st => {
                          const isSelected = (editingSection.activeStyle || 'soft') === st.value;
                          return (
                            <button
                              key={st.value}
                              type="button"
                              onClick={() => updateSection(editingSection.id, { activeStyle: st.value })}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${isSelected ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                            >
                              <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                                {st.label}
                                {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{st.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Font Family Selection */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                      টাইপোগ্রাফি ও ফন্ট (Font Family)
                    </label>
                    <select
                      value={editingItem.type === 'section' ? (editingSection?.enFont || 'font-sans') : (editingPage?.enFont || 'font-sans')}
                      onChange={(e) => {
                        const val = e.target.value as FontFamily;
                        if (editingItem.type === 'section') {
                          updateSection(editingItem.id, { enFont: val });
                        } else {
                          updateChildPage(editingItem.sectionId, editingItem.id, { enFont: val });
                        }
                      }}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                    >
                      {FONT_OPTIONS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* TAB 3: ROLE PERMISSIONS (RBAC for Sections & Individual Pages) */}
              {activeTab === 'permissions' && (
                <div className="space-y-4">
                  {editingItem.type === 'section' && editingSection && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          সেকশন রোল পারমিশন (Section Role Visibility)
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          যেসব ইউজার রোলের টিকচিহ্ন থাকবে তারাই শুধুমাত্র সাইডবারে এই পুরো সেকশনটি দেখতে পাবে।
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        {allRoles.map(role => (
                          <label key={role} className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer p-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={editingSection.roles.includes(role)}
                              onChange={(e) => {
                                const newRoles = e.target.checked 
                                  ? [...editingSection.roles, role]
                                  : editingSection.roles.filter(r => r !== role);
                                updateSection(editingSection.id, { roles: newRoles });
                              }}
                            />
                            <span className="uppercase text-[11px]">{role.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => updateSection(editingSection.id, { roles: [...allRoles] })}
                          className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Select All Roles
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSection(editingSection.id, { roles: [] })}
                          className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
                        >
                          Clear All (Public Access)
                        </button>
                      </div>
                    </div>
                  )}

                  {editingItem.type === 'page' && editingPage && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          নির্দিষ্ট পেজ পারমিশন (Page Specific Roles)
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          কোনো রোল সিলেক্ট না থাকলে এই পেজটি স্বয়ংক্রিয়ভাবে তার প্যারেন্ট সেকশনের রুলস ফলো করবে।
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        {allRoles.map(role => (
                          <label key={role} className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer p-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                            <input 
                              type="checkbox" 
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={editingPage.roles?.includes(role) || false}
                              onChange={(e) => {
                                const currentRoles = editingPage.roles || [];
                                const newRoles = e.target.checked 
                                  ? [...currentRoles, role]
                                  : currentRoles.filter(r => r !== role);
                                updateChildPage(editingItem.sectionId, editingPage.id, { roles: newRoles });
                              }}
                            />
                            <span className="uppercase text-[11px]">{role.replace('_', ' ')}</span>
                          </label>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <button
                          type="button"
                          onClick={() => updateChildPage(editingItem.sectionId, editingPage.id, { roles: [...allRoles] })}
                          className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          Select All Roles
                        </button>
                        <button
                          type="button"
                          onClick={() => updateChildPage(editingItem.sectionId, editingPage.id, { roles: [] })}
                          className="text-[11px] font-bold text-slate-500 hover:underline cursor-pointer"
                        >
                          Inherit From Section
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PAGE FUNCTIONS, WIDGETS & CUSTOM CODE */}
              {activeTab === 'functions' && (
                <div className="space-y-4">
                  {editingItem.type === 'page' && editingPage ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                          ইন্টারেক্টিভ ফাংশন / উইজেট টাইপ (Widget & Function)
                        </label>
                        <div className="space-y-2">
                          {WIDGET_OPTIONS.map(w => {
                            const isSelected = (editingPage.widgetType || 'default') === w.id;
                            return (
                              <button
                                key={w.id}
                                type="button"
                                onClick={() => updateChildPage(editingItem.sectionId, editingPage.id, { widgetType: w.id })}
                                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-500' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                              >
                                <div>
                                  <div className="font-bold text-xs text-slate-800">{w.label}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">{w.desc}</div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                          পেজ বিবরণ / কাস্টম সাবটাইটেল (Description)
                        </label>
                        <textarea
                          rows={2}
                          value={editingPage.customDescription || ''}
                          onChange={(e) => updateChildPage(editingItem.sectionId, editingPage.id, { customDescription: e.target.value })}
                          placeholder="এই পেজের মূল উদ্দেশ্য বা ব্যবহার নির্দেশিকা লিখুন..."
                          className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <Code2 className="w-3 h-3 text-indigo-600" />
                            কাস্টম জাভাস্ক্রিপ্ট / কোড স্নsnippet (Code Sandbox)
                          </label>
                        </div>
                        <textarea
                          rows={4}
                          value={editingPage.customCodeSnippet || ''}
                          onChange={(e) => updateChildPage(editingItem.sectionId, editingPage.id, { customCodeSnippet: e.target.value })}
                          placeholder="// Write custom JS function or API call logic here..."
                          className="w-full p-2.5 font-mono text-[11px] border border-slate-200 rounded-xl bg-slate-900 text-emerald-400 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <Cpu className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-700">সেকশনের ভেতরে কোনো চাইল্ড পেজ সিলেক্ট করুন</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        বাম পাশের ট্রি থেকে যেকোনো চাইল্ড পেজের সেটিংস আইকন ক্লিক করলে তার নিজস্ব ফাংশন, উইজেট এবং কোড বক্স প্রদর্শিত হবে।
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : null}
        </div>
      </div>

      {/* Persistent Cloud Sync Bar */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] w-[calc(100%-2rem)] max-w-lg bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center justify-between gap-4 transition-all duration-300 ${isSaving ? 'scale-95 opacity-80' : 'hover:-translate-y-1'}`}>
        <div>
          <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase block">
            {isSaving ? 'SYNCING TO CLOUD...' : 'PERSISTENT CLOUD SYNC'}
          </span>
          <span className="text-xs font-bold text-gray-800">
            {isSaving ? 'পরিবর্তন সেভ করা হচ্ছে...' : 'সব সাইডবার কনফিগারেশন রিয়েলটাইমে সেভ আছে'}
          </span>
        </div>
        <button 
          onClick={saveToCloud}
          disabled={isSaving}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
          <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
          সংরক্ষণ করুন (Save)
        </button>
      </div>
    </div>
  );
}

