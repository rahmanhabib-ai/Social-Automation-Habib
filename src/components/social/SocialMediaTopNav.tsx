import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Radio, Bot, MessageSquare, Settings, Sparkles, FolderGit2 } from 'lucide-react';

interface SocialMediaTopNavProps {
  activeTab: 'create_schedule_post' | 'spark_ai_scheduler' | 'google_drive_spark' | 'whatsapp_channels_groups' | 'auto_comment_dm' | 'omnichannel_inbox' | 'platform_api_settings';
}

export default function SocialMediaTopNav({ activeTab }: SocialMediaTopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const portal = pathSegments[0] === 'user' ? 'user' : 'admin';

  const navItems = [
    {
      id: 'create_schedule_post',
      enLabel: 'Create & Schedule Post',
      bnLabel: 'পোস্ট তৈরি ও শিডিউল',
      icon: Send,
      color: 'purple',
      badge: 'Multi-Network'
    },
    {
      id: 'spark_ai_scheduler',
      enLabel: 'Spark AI Campaign Scheduler',
      bnLabel: 'স্পার্ক এআই শিডিউলার',
      icon: Sparkles,
      color: 'indigo',
      badge: 'Auto-Pilot'
    },
    {
      id: 'google_drive_spark',
      enLabel: 'Google Drive & Spark Studio',
      bnLabel: 'গুগল ড্রাইভ ও স্পার্ক স্টুডিও',
      icon: FolderGit2,
      color: 'blue',
      badge: 'Docs Sync'
    },
    {
      id: 'whatsapp_channels_groups',
      enLabel: 'WhatsApp Channels & Groups Hub',
      bnLabel: 'হোয়াটসঅ্যাপ চ্যানেল ও গ্রুপ হাব',
      icon: Radio,
      color: 'emerald',
      badge: 'Unlimited'
    },
    {
      id: 'auto_comment_dm',
      enLabel: 'Auto Comment & DM Rules',
      bnLabel: 'অটো কমেন্ট ও ডিএম',
      icon: Bot,
      color: 'blue'
    },
    {
      id: 'omnichannel_inbox',
      enLabel: 'Omnichannel Inbox & AI Agent',
      bnLabel: 'অমনি ইনবক্স ও এআই চ্যাট',
      icon: MessageSquare,
      color: 'amber'
    },
    {
      id: 'platform_api_settings',
      enLabel: 'Platform API Settings',
      bnLabel: 'প্ল্যাটফর্ম এপিআই সেটিংস',
      icon: Settings,
      color: 'slate'
    }
  ];

  const handleNavigate = (itemId: string) => {
    navigate(`/${portal}/marketing_content_section/${itemId}`);
  };

  return (
    <div className="mb-6 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? item.id === 'whatsapp_channels_groups'
                    ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-current' : 'text-slate-400'}`} />
              <span>{item.bnLabel}</span>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : item.id === 'whatsapp_channels_groups'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
