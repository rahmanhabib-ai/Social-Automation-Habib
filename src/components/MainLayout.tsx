import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import ControllerHub from './ControllerHub';
import SidebarPagesControl from './SidebarPagesControl';
import DynamicPageRenderer from './DynamicPageRenderer';
import PageCodeStudio from './PageCodeStudio';
import { 
  ChevronRight, 
  Lock, 
  Terminal, 
  Shield, 
  User, 
  LogOut, 
  LayoutGrid, 
  Share2, 
  Globe, 
  Copy, 
  Check, 
  ExternalLink, 
  QrCode, 
  X,
  CheckCircle2,
  Smartphone
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { getPublicLiveOrigin } from '../utils/publicUrl';
import { saveActiveRoute, clearActiveSession } from '../utils/session';
import * as Icons from 'lucide-react';

interface MainLayoutProps {
  portalType: 'admin' | 'user';
}

export default function MainLayout({ portalType }: MainLayoutProps) {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { sections, lockMessage, updateChildPage } = useSidebar();
  
  // Extract route segments:
  // Can be /[portal]/[sectionId]/[pageId] or /[portal]/[pageId] or /[pageId]
  const pathSegments = routerLocation.pathname.split('/').filter(Boolean);
  const currentPrefix = pathSegments[0] === 'user' ? 'user' : (pathSegments[0] === 'admin' || pathSegments[0] === 'business_admin' || pathSegments[0] === 'business-admin') ? pathSegments[0] : portalType;
  
  // Resolve activePage from segments
  const resolvePageFromSegments = (segments: string[]): string => {
    if (segments.length >= 3) {
      // Format: /[portal]/[sectionId]/[pageId]
      const sectionSlug = segments[1];
      const pageSlug = segments[2];
      const section = sections.find(s => s.id === sectionSlug);
      if (section) {
        const child = section.children.find(c => c.id === pageSlug);
        if (child) return child.id;
      }
      return pageSlug;
    } else if (segments.length === 2) {
      // Format: /[portal]/[id] (could be special page 'controller' or a page id or section id)
      const slug = segments[1];
      if (slug === 'controller' || slug === 'sidebar_panel' || slug === 'sidebar_pages') {
        return slug;
      }
      // Check if it matches a child page directly
      for (const s of sections) {
        const c = s.children.find(child => child.id === slug);
        if (c) return c.id;
      }
      // Or if it matches a section, return its first child
      const sec = sections.find(s => s.id === slug);
      if (sec && sec.children.length > 0) {
        return sec.children[0].id;
      }
      return slug;
    } else if (segments.length === 1) {
      // Single segment like /controller or /analytics
      const slug = segments[0];
      if (slug === 'admin' || slug === 'user' || slug === 'business_admin' || slug === 'business-admin') {
        const defaultUserPage = sections.find(s => s.roles.includes('user') || s.roles.length === 0)?.children.find(c => c.roles?.includes('user') || !c.roles || c.roles.length === 0)?.id || '';
        return slug === 'user' ? defaultUserPage : 'controller';
      }
      for (const s of sections) {
        const c = s.children.find(child => child.id === slug);
        if (c) return c.id;
      }
      const sec = sections.find(s => s.id === slug);
      if (sec && sec.children.length > 0) {
        return sec.children[0].id;
      }
      return slug;
    }
    const defaultUserPage = sections.find(s => s.roles.includes('user') || s.roles.length === 0)?.children.find(c => c.roles?.includes('user') || !c.roles || c.roles.length === 0)?.id || '';
    return portalType === 'admin' ? 'controller' : defaultUserPage;
  };

  const [activePage, setActivePage] = useState<string>(() => resolvePageFromSegments(pathSegments));
  const [showCodeStudio, setShowCodeStudio] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedShareKey, setCopiedShareKey] = useState<string | null>(null);

  const getPublicOrigin = () => {
    return getPublicLiveOrigin();
  };

  const currentPublicUrl = `${getPublicOrigin()}${routerLocation.pathname}`;

  const copyShareUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedShareKey(key);
    setTimeout(() => setCopiedShareKey(null), 2500);
  };

  useEffect(() => {
    const segments = routerLocation.pathname.split('/').filter(Boolean);
    const resolved = resolvePageFromSegments(segments);
    if (resolved) {
      setActivePage(resolved);
      setShowCodeStudio(false);
    }
    // Always persist the current route in active session so reloads stay on this exact page
    saveActiveRoute(routerLocation.pathname, routerLocation.search);
  }, [routerLocation.pathname, routerLocation.search, sections, portalType]);

  const handlePageChange = (pageId: string) => {
    setActivePage(pageId);
    setShowCodeStudio(false);
    
    // Special admin control hubs stay flat: /[portal]/controller or /[portal]/sidebar_pages
    if (pageId === 'controller' || pageId === 'sidebar_panel' || pageId === 'sidebar_pages') {
      navigate(`/${currentPrefix}/${pageId}`);
      return;
    }

    // Find parent section to construct hierarchical URL /[portal]/[sectionId]/[pageId]
    const parentSection = sections.find(s => s.children.some(c => c.id === pageId));
    if (parentSection) {
      navigate(`/${currentPrefix}/${parentSection.id}/${pageId}`);
    } else {
      navigate(`/${currentPrefix}/${pageId}`);
    }
  };

  // Helper to find the current location (Parent and Child)
  const getLocationDetails = () => {
    // 1. Search in user's active sections state
    for (const section of sections) {
      const child = section.children.find(c => c.id === activePage);
      if (child) {
        const ParentIcon = (Icons as any)[section.iconName] || Icons.LayoutDashboard;
        const ChildIcon = (Icons as any)[child.iconName] || Icons.File;
        return {
          parentSection: section,
          childItem: child,
          parentName: section.enLabel,
          parentBnName: section.bnLabel,
          childName: child.enLabel,
          childBnName: child.bnLabel,
          ParentIcon,
          ChildIcon
        };
      }
    }

    // 2. Known Social Media & WhatsApp Hub Fallback
    const pageLower = (activePage || '').toLowerCase();
    if (
      pageLower === 'whatsapp_channels_groups' ||
      pageLower === 'whatsapp_hub' ||
      pageLower === 'channels_groups' ||
      pageLower === 'whatsapp_channels' ||
      pageLower === 'whatsapp_groups' ||
      pageLower.includes('whatsapp') ||
      pageLower.includes('channel')
    ) {
      return {
        parentSection: {
          id: 'marketing_content_section',
          enLabel: 'Social Media & WhatsApp',
          bnLabel: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ',
          iconName: 'Share2',
          isLocked: false,
          roles: ['admin', 'manager', 'assistant_manager', 'sales_manager', 'sales_team', 'user'] as any[],
          color: 'rose' as any,
          children: []
        },
        childItem: {
          id: 'whatsapp_channels_groups',
          enLabel: 'WhatsApp Channels & Groups Hub',
          bnLabel: 'হোয়াটসঅ্যাপ চ্যানেল ও গ্রুপ হাব',
          iconName: 'Radio',
          isLocked: false,
          roles: ['user', 'admin'] as any[],
          widgetType: 'whatsapp_channels_groups'
        },
        parentName: 'Social Media & WhatsApp',
        parentBnName: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ',
        childName: 'WhatsApp Channels & Groups Hub',
        childBnName: 'হোয়াটসঅ্যাপ চ্যানেল ও গ্রুপ হাব',
        ParentIcon: Icons.Share2,
        ChildIcon: Icons.Radio
      };
    }

    if (pageLower === 'create_schedule_post' || pageLower === 'schedule_post') {
      return {
        parentSection: { id: 'marketing_content_section', enLabel: 'Social Media & WhatsApp', bnLabel: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ', iconName: 'Share2', isLocked: false, roles: ['user', 'admin'] as any[], color: 'rose' as any, children: [] },
        childItem: { id: 'create_schedule_post', enLabel: 'Create & Schedule Post', bnLabel: 'পোস্ট তৈরি ও শিডিউল', iconName: 'Send', isLocked: false, roles: ['user', 'admin'] as any[] },
        parentName: 'Social Media & WhatsApp',
        parentBnName: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ',
        childName: 'Create & Schedule Post',
        childBnName: 'পোস্ট তৈরি ও শিডিউল',
        ParentIcon: Icons.Share2,
        ChildIcon: Icons.Send
      };
    }

    if (pageLower === 'google_drive_spark' || pageLower === 'drive_sync' || pageLower === 'google_docs' || pageLower.includes('google_drive') || pageLower.includes('drive_spark')) {
      return {
        parentSection: { id: 'marketing_content_section', enLabel: 'Social Media & WhatsApp', bnLabel: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ', iconName: 'Share2', isLocked: false, roles: ['user', 'admin'] as any[], color: 'rose' as any, children: [] },
        childItem: { id: 'google_drive_spark', enLabel: 'Google Drive & Spark Studio', bnLabel: 'গুগল ড্রাইভ ও স্পার্ক স্টুডিও', iconName: 'FolderGit2', isLocked: false, roles: ['user', 'admin'] as any[] },
        parentName: 'Social Media & WhatsApp',
        parentBnName: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ',
        childName: 'Google Drive & Spark Studio',
        childBnName: 'গুগল ড্রাইভ ও স্পার্ক স্টুডিও',
        ParentIcon: Icons.Share2,
        ChildIcon: (Icons as any).FolderGit2 || Icons.Folder || Icons.FileText
      };
    }

    if (pageLower === 'spark_ai_scheduler' || pageLower === 'spark_scheduler' || pageLower === 'spark_campaign' || pageLower === 'spark_studio') {
      return {
        parentSection: { id: 'marketing_content_section', enLabel: 'Social Media & WhatsApp', bnLabel: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ', iconName: 'Share2', isLocked: false, roles: ['user', 'admin'] as any[], color: 'rose' as any, children: [] },
        childItem: { id: 'spark_ai_scheduler', enLabel: 'Spark AI Campaign Scheduler', bnLabel: 'স্পার্ক এআই শিডিউলার', iconName: 'Sparkles', isLocked: false, roles: ['user', 'admin'] as any[] },
        parentName: 'Social Media & WhatsApp',
        parentBnName: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ',
        childName: 'Spark AI Campaign Scheduler',
        childBnName: 'স্পার্ক এআই শিডিউলার',
        ParentIcon: Icons.Share2,
        ChildIcon: Icons.Sparkles
      };
    }

    if (pageLower === 'auto_comment_dm' || pageLower === 'comment_rules') {
      return {
        parentSection: { id: 'marketing_content_section', enLabel: 'Social Media & WhatsApp', bnLabel: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ', iconName: 'Share2', isLocked: false, roles: ['user', 'admin'] as any[], color: 'rose' as any, children: [] },
        childItem: { id: 'auto_comment_dm', enLabel: 'Auto Comment & DM Rules', bnLabel: 'অটো কমেন্ট ও ডিএম রুলস', iconName: 'Bot', isLocked: false, roles: ['user', 'admin'] as any[] },
        parentName: 'Social Media & WhatsApp',
        parentBnName: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ',
        childName: 'Auto Comment & DM Rules',
        childBnName: 'অটো কমেন্ট ও ডিএম রুলস',
        ParentIcon: Icons.Share2,
        ChildIcon: Icons.Bot
      };
    }

    if (pageLower === 'omnichannel_inbox' || pageLower === 'omni_inbox') {
      return {
        parentSection: { id: 'marketing_content_section', enLabel: 'Social Media & WhatsApp', bnLabel: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ', iconName: 'Share2', isLocked: false, roles: ['user', 'admin'] as any[], color: 'rose' as any, children: [] },
        childItem: { id: 'omnichannel_inbox', enLabel: 'Omnichannel Inbox & AI Agent', bnLabel: 'অমনি ইনবক্স ও এআই এজেন্ট', iconName: 'MessageSquare', isLocked: false, roles: ['user', 'admin'] as any[] },
        parentName: 'Social Media & WhatsApp',
        parentBnName: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ',
        childName: 'Omnichannel Inbox & AI Agent',
        childBnName: 'অমনি ইনবক্স ও এআই এজেন্ট',
        ParentIcon: Icons.Share2,
        ChildIcon: Icons.MessageSquare
      };
    }

    if (pageLower === 'platform_api_settings' || pageLower === 'api_settings') {
      return {
        parentSection: { id: 'marketing_content_section', enLabel: 'Social Media & WhatsApp', bnLabel: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ', iconName: 'Share2', isLocked: false, roles: ['user', 'admin'] as any[], color: 'rose' as any, children: [] },
        childItem: { id: 'platform_api_settings', enLabel: 'Platform API & WhatsApp Settings', bnLabel: 'প্ল্যাটফর্ম এপিআই ও হোয়াটসঅ্যাপ সেটিংস', iconName: 'Settings', isLocked: false, roles: ['user', 'admin'] as any[] },
        parentName: 'Social Media & WhatsApp',
        parentBnName: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ',
        childName: 'Platform API & WhatsApp Settings',
        childBnName: 'প্ল্যাটফর্ম এপিআই ও হোয়াটসঅ্যাপ সেটিংস',
        ParentIcon: Icons.Share2,
        ChildIcon: Icons.Settings
      };
    }

    // 3. Fallback generic virtual location
    if (activePage && activePage !== 'controller' && activePage !== 'sidebar_panel') {
      const cleanLabel = activePage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        parentSection: { id: 'general_section', enLabel: 'General', bnLabel: 'সাধারণ', iconName: 'Layers', isLocked: false, roles: ['user', 'admin'] as any[], color: 'indigo' as any, children: [] },
        childItem: { id: activePage, enLabel: cleanLabel, bnLabel: cleanLabel, iconName: 'File', isLocked: false, roles: ['user', 'admin'] as any[] },
        parentName: 'General',
        parentBnName: 'সাধারণ',
        childName: cleanLabel,
        childBnName: cleanLabel,
        ParentIcon: Icons.Layers,
        ChildIcon: Icons.File
      };
    }

    return null;
  };

  const location = getLocationDetails();
  const isSpecialAdminPage = activePage === 'controller' || activePage === 'sidebar_panel' || activePage === 'sidebar_pages';
  const isCurrentlyLocked = portalType === 'user' && (location?.parentSection.isLocked || location?.childItem.isLocked);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <AdminSidebar activePage={activePage} setActivePage={handlePageChange} portalType={portalType} />
      
      <main className="flex-1 relative flex flex-col overflow-hidden bg-slate-50/50">
        {/* Top Header / Breadcrumb Bar with Live Standalone App URL */}
        <header className="h-20 px-6 md:px-8 flex items-center justify-between border-b border-slate-200 bg-white shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {location && (
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex items-center gap-2 text-slate-500">
                  <location.ParentIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold">{location.parentName}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
                <div className="flex items-center gap-2 text-blue-700">
                  <location.ChildIcon className="w-4 h-4" />
                  <span className="text-sm font-bold">{location.childName}</span>
                </div>
                {/* Live URL Route badge */}
                <div className="ml-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[11px] font-mono text-indigo-700 font-bold hidden lg:flex items-center gap-1">
                  <span className="text-indigo-400">/{currentPrefix}/</span>
                  <span>{location.parentSection.id}</span>
                  <span className="text-indigo-400">/</span>
                  <span className="text-indigo-900">{location.childItem.id}</span>
                </div>
                {isCurrentlyLocked && (
                  <div className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> LOCKED
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Share Public Universal URL Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">অন্য ডিভাইসে টেস্ট (No 403)</span>
              <span className="sm:hidden">Share</span>
            </button>

            {/* Logged-In User Role & Portal Badge */}
            <div className="hidden sm:flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 text-xs shadow-xs">
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white ${
                portalType === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
              }`}>
                {portalType === 'admin' ? <Shield className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-slate-800 text-[11px]">
                  {portalType === 'admin' ? 'Super Admin' : 'Portal User'}
                </span>
                <span className="text-[9px] font-mono text-slate-500 font-semibold">
                  {portalType === 'admin' ? 'অ্যাডমিন প্যানেল (/admin)' : 'ইউজার প্যানেল (/user)'}
                </span>
              </div>
              <button
                onClick={() => {
                  clearActiveSession();
                  window.location.href = '/?logout=true';
                }}
                title="লগ আউট করুন (Log Out)"
                className="ml-1 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {portalType === 'admin' && location && !isSpecialAdminPage && (
              <button
                onClick={() => setShowCodeStudio(!showCodeStudio)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${showCodeStudio ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                <Terminal className="w-4 h-4" /> {showCodeStudio ? 'View Page' : 'Code Studio'}
              </button>
            )}
          </div>
        </header>

        {/* Global Share Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">অন্যান্য ডিভাইসে উন্মুক্ত লাইভ অ্যাক্সেস</h3>
                  <p className="text-xs text-slate-500 font-medium">Universal Public Live Link (No 403 Forbidden)</p>
                </div>
              </div>

              {/* URL Display and Copy */}
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>লাইভ পাবলিক লিংক (Public URL):</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ✓ Open to All Devices
                    </span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-xs text-indigo-900 font-semibold break-all select-all">
                    {currentPublicUrl}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => copyShareUrl(currentPublicUrl, 'modal_current')}
                      className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copiedShareKey === 'modal_current' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>লিংক কপি হয়েছে!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>পাবলিক লিংক কপি করুন (Copy Link)</span>
                        </>
                      )}
                    </button>
                    <a
                      href={currentPublicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>ওপেন</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Direct Admin vs User Links */}
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    onClick={() => copyShareUrl(`${getPublicOrigin()}/admin/controller`, 'modal_admin')}
                    className="p-3 bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200 rounded-xl text-left transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-900 font-bold">Admin Portal</span>
                      {copiedShareKey === 'modal_admin' && <span className="text-emerald-600 text-[10px]">✓ Copied</span>}
                    </div>
                    <p className="text-[10px] text-indigo-600 font-mono">/admin/controller</p>
                  </button>

                  <button
                    onClick={() => copyShareUrl(`${getPublicOrigin()}/user`, 'modal_user')}
                    className="p-3 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-left transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-900 font-bold">User Portal</span>
                      {copiedShareKey === 'modal_user' && <span className="text-emerald-600 text-[10px]">✓ Copied</span>}
                    </div>
                    <p className="text-[10px] text-emerald-600 font-mono">/user</p>
                  </button>
                </div>

                {/* 403 Technical Explanation */}
                <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>কেন ব্রাউজার থেকে কপি করলে 403 এরর আসছিল?</span>
                  </div>
                  <p className="text-[11px] text-amber-900/90 leading-relaxed">
                    আপনার এই ডেভেলপমেন্ট স্ক্রিনের অ্যাড্রেস বারে গুগল ক্লাউডের নিজস্ব <code className="bg-amber-200/60 font-mono px-1 py-0.5 rounded font-bold">ais-dev</code> লিংক রয়েছে। গুগল এটি শুধুমাত্র যিনি কোডিং করছেন তার জন্য সিকিউর রাখে। অন্য ডিভাইস বা সাধারণ ব্রাউজারদের জন্য গুগল স্বয়ংক্রিয় <code className="bg-emerald-200/80 font-mono px-1 py-0.5 rounded font-bold text-emerald-900">ais-pre</code> পাবলিক প্রিভিউ দেয়। উপরের কপি বাটনে ক্লিক করলে ১০০% উন্মুক্ত লিংকটিই কপি হয়।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {activePage === 'controller' && portalType === 'admin' ? (
            <ControllerHub />
          ) : (activePage === 'sidebar_panel' || activePage === 'sidebar_pages') && portalType === 'admin' ? (
            <SidebarPagesControl />
          ) : isSpecialAdminPage && portalType === 'user' ? (
            <div className="max-w-4xl mx-auto mt-16 flex flex-col items-center justify-center text-center px-8">
              <p className="text-slate-500">Not authorized to view admin controls.</p>
            </div>
          ) : isCurrentlyLocked ? (
            <div className="max-w-4xl mx-auto mt-16 flex flex-col items-center justify-center text-center px-8">
              <div className="bg-white p-8 rounded-3xl border border-rose-100 shadow-lg shadow-rose-500/5 max-w-lg w-full flex flex-col items-center">
                <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mb-4 text-rose-600">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Section Locked</h2>
                <p className="text-rose-600 font-medium text-center">{lockMessage}</p>
              </div>
            </div>
          ) : location ? (
            showCodeStudio && portalType === 'admin' ? (
              <PageCodeStudio
                page={location.childItem}
                sectionName={location.parentName}
                onUpdateCode={(updates) => updateChildPage(location.parentSection.id, location.childItem.id, updates)}
                onClose={() => setShowCodeStudio(false)}
              />
            ) : (
              <DynamicPageRenderer
                page={location.childItem}
                section={location.parentSection}
                portalType={portalType}
                onOpenCodeStudio={() => setShowCodeStudio(true)}
              />
            )
          ) : (
            <div className="max-w-4xl mx-auto mt-16 flex flex-col items-center justify-center text-center px-8">
              <p className="text-slate-500">Page not found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
