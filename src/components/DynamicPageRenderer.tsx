import React, { useState, useEffect } from 'react';
import { PageItem, SidebarSection } from '../context/SidebarContext';
import { Plus, Trash2, FileText, Cpu, Terminal, Sparkles } from 'lucide-react';
import MessageGatewayPage from './MessageGatewayPage';
import CreateSchedulePostPage from './social/CreateSchedulePostPage';
import SparkAiSchedulerPage from './social/SparkAiSchedulerPage';
import { GoogleWorkspaceStudio } from './workspace/GoogleWorkspaceStudio';
import { GoogleDriveSparkStudio } from './social/GoogleDriveSparkStudio';
import AutoCommentDmRulesPage from './social/AutoCommentDmRulesPage';
import OmnichannelInboxPage from './social/OmnichannelInboxPage';
import PlatformApiSettingsPage from './social/PlatformApiSettingsPage';
import WhatsAppChannelsGroupsHub from './whatsapp/WhatsAppChannelsGroupsHub';

interface DynamicPageRendererProps {
  page: PageItem;
  section: SidebarSection;
  portalType: 'admin' | 'user';
  onOpenCodeStudio?: () => void;
}

export default function DynamicPageRenderer({ page, section, portalType, onOpenCodeStudio }: DynamicPageRendererProps) {
  const widgetType = page.widgetType || 'default';
  const pageIdLower = (page.id || '').toLowerCase();
  const pageEnLower = (page.enLabel || '').toLowerCase();
  const pageBnLower = (page.bnLabel || '').toLowerCase();

  // Route to WhatsApp Channels & Groups Hub
  if (
    pageIdLower === 'whatsapp_channels_groups' ||
    pageIdLower === 'whatsapp_hub' ||
    pageIdLower === 'channels_groups' ||
    pageIdLower === 'whatsapp_channels' ||
    pageIdLower === 'whatsapp_groups' ||
    widgetType === 'whatsapp_channels_groups' ||
    (pageEnLower.includes('channel') && pageEnLower.includes('group')) ||
    (pageEnLower.includes('whatsapp') && (pageEnLower.includes('channel') || pageEnLower.includes('group') || pageEnLower.includes('hub'))) ||
    (pageBnLower.includes('চ্যানেল') && pageBnLower.includes('গ্রুপ')) ||
    (pageBnLower.includes('হোয়াটসঅ্যাপ') && (pageBnLower.includes('চ্যানেল') || pageBnLower.includes('গ্রুপ')))
  ) {
    return <WhatsAppChannelsGroupsHub />;
  }

  // Route to Create & Schedule Post
  if (
    pageIdLower === 'create_schedule_post' || 
    pageIdLower === 'schedule_post' ||
    pageEnLower.includes('schedule post') || 
    pageEnLower.includes('create post') ||
    pageBnLower.includes('শিডিউল পোস্ট') ||
    pageBnLower.includes('পোস্ট তৈরি')
  ) {
    return <CreateSchedulePostPage />;
  }

  // Route to Google Workspace Studio (Google Drive, Google Sheets, Google Docs)
  if (
    pageIdLower === 'google_workspace' ||
    pageIdLower === 'google_drive' ||
    pageIdLower === 'google_sheets' ||
    pageIdLower === 'google_docs' ||
    pageIdLower === 'google_drive_spark' ||
    pageIdLower === 'drive_sync' ||
    pageIdLower === 'workspace_hub' ||
    pageEnLower.includes('google drive') ||
    pageEnLower.includes('google sheet') ||
    pageEnLower.includes('google doc') ||
    pageEnLower.includes('drive sync') ||
    pageEnLower.includes('workspace') ||
    pageBnLower.includes('গুগল ড্রাইভ') ||
    pageBnLower.includes('গুগল শিট') ||
    pageBnLower.includes('গুগল ডক') ||
    pageBnLower.includes('ড্রাইভ সিঙ্ক') ||
    pageBnLower.includes('ড্রাইভ ও স্পার্ক')
  ) {
    return <GoogleWorkspaceStudio initialTab="spark" />;
  }

  // Route to Spark AI Campaign Scheduler
  if (
    pageIdLower === 'spark_ai_scheduler' ||
    pageIdLower === 'spark_scheduler' ||
    pageIdLower === 'spark_campaign' ||
    (pageEnLower.includes('spark') && !pageEnLower.includes('drive')) ||
    (pageBnLower.includes('স্পার্ক') && !pageBnLower.includes('ড্রাইভ'))
  ) {
    return <SparkAiSchedulerPage />;
  }

  // Route to Auto Comment & DM Rules
  if (
    pageIdLower === 'auto_comment_dm' || 
    pageIdLower === 'comment_rules' ||
    pageEnLower.includes('comment') || 
    pageEnLower.includes('dm rule') ||
    pageBnLower.includes('অটো কমেন্ট') ||
    pageBnLower.includes('কমেন্ট ও ডিএম')
  ) {
    return <AutoCommentDmRulesPage />;
  }

  // Route to Omnichannel Inbox & AI Agent
  if (
    pageIdLower === 'omnichannel_inbox' || 
    pageIdLower === 'omni_inbox' ||
    pageIdLower === 'ai_inbox' ||
    pageEnLower.includes('omnichannel') || 
    pageEnLower.includes('inbox') ||
    pageBnLower.includes('অমনি ইনবক্স') ||
    pageBnLower.includes('ইনবক্স')
  ) {
    return <OmnichannelInboxPage />;
  }

  // Route to Platform API & Channel Settings
  if (
    pageIdLower === 'platform_api_settings' || 
    pageIdLower === 'social_api_settings' ||
    pageIdLower === 'api_settings' ||
    pageEnLower.includes('platform api') || 
    pageEnLower.includes('channel settings') ||
    pageEnLower.includes('api settings') ||
    pageBnLower.includes('প্ল্যাটফর্ম এপিআই') ||
    pageBnLower.includes('চ্যানেল সেটিংস') ||
    pageBnLower.includes('এপিআই সেটিংস')
  ) {
    return <PlatformApiSettingsPage />;
  }

  const isMessageGateway = widgetType === 'message_gateway' || 
    widgetType === 'whatsapp_gateway' || 
    page.id === 'message_gateway' || 
    page.id === 'whatsapp_gateway' || 
    page.enLabel.toLowerCase().includes('message') || 
    page.enLabel.toLowerCase().includes('whatsapp') || 
    page.bnLabel.includes('মেসেজ') ||
    page.bnLabel.includes('হোয়াটসঅ্যাপ');

  if (isMessageGateway) {
    return <MessageGatewayPage page={page} section={section} portalType={portalType} />;
  }

  return (
    <StandardDynamicPage 
      page={page} 
      section={section} 
      portalType={portalType} 
      onOpenCodeStudio={onOpenCodeStudio} 
    />
  );
}

function StandardDynamicPage({ page, section, portalType, onOpenCodeStudio }: DynamicPageRendererProps) {
  const widgetType = page.widgetType || 'default';

  // Local states for interactive widgets
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState<{ id: string; text: string; completed: boolean }[]>([
    { id: '1', text: 'Initialize module structure', completed: true },
    { id: '2', text: 'Configure role permissions', completed: false },
  ]);
  const [newTodo, setNewTodo] = useState('');
  const [noteContent, setNoteContent] = useState('Write your persistent notes for ' + page.enLabel + ' here...');
  const [metricValue] = useState(12840);

  useEffect(() => {
    const savedNotes = localStorage.getItem(`notes_${page.id}`);
    if (savedNotes) setNoteContent(savedNotes);
  }, [page.id]);

  const saveNotes = (val: string) => {
    setNoteContent(val);
    localStorage.setItem(`notes_${page.id}`, val);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 mb-16 px-6 text-left">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Cpu className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                  {section.enLabel} ({section.bnLabel})
                </span>
                <span className="text-xs text-slate-400 font-bold">• Active Module</span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {page.enLabel}
              </h1>
              <h2 className="text-xl font-bold text-slate-600 mt-0.5">
                {page.bnLabel}
              </h2>
            </div>
          </div>

          {portalType === 'admin' && onOpenCodeStudio && (
            <button
              onClick={onOpenCodeStudio}
              className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Terminal className="w-4 h-4" /> Edit Code & Widgets
            </button>
          )}
        </div>

        <p className="text-slate-600 mt-4 text-sm leading-relaxed max-w-2xl font-medium">
          {page.customDescription || `আপনি বর্তমানে ${section.enLabel} (${section.bnLabel}) সেকশনের অধীনে ${page.enLabel} (${page.bnLabel}) পেজে আছেন। এই পেজটি সম্পূর্ণ গতিশীল এবং কোড/উইজেট কনফিগারযোগ্য।`}
        </p>
      </div>

      {/* Dynamic Widget Content based on widgetType */}
      {widgetType === 'counter' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Interactive Counter State</h3>
          <div className="text-6xl font-black text-indigo-600 my-6">{count}</div>
          <div className="flex justify-center gap-3">
            <button 
              onClick={() => setCount(c => c - 1)}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-sm cursor-pointer"
            >
              Decrease (-)
            </button>
            <button 
              onClick={() => setCount(c => c + 1)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/25 cursor-pointer"
            >
              Increase (+)
            </button>
          </div>
        </div>
      )}

      {widgetType === 'todo' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Module Task Checklist</h3>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Add new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTodo.trim()) {
                  setTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), completed: false }]);
                  setNewTodo('');
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => {
                if (newTodo.trim()) {
                  setTodos([...todos, { id: Date.now().toString(), text: newTodo.trim(), completed: false }]);
                  setNewTodo('');
                }
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="space-y-2.5">
            {todos.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => setTodos(todos.map(x => x.id === t.id ? { ...x, completed: !x.completed } : x))}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={`text-sm font-medium ${t.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {t.text}
                  </span>
                </label>
                <button
                  onClick={() => setTodos(todos.filter(x => x.id !== t.id))}
                  className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {widgetType === 'notes' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Persistent Page Notes</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Auto-saved to Local Storage</span>
          </div>
          <textarea
            rows={8}
            value={noteContent}
            onChange={(e) => saveNotes(e.target.value)}
            className="w-full p-4 rounded-2xl border border-slate-200 text-sm text-slate-800 outline-none focus:border-indigo-500 bg-slate-50/50 leading-relaxed"
          />
        </div>
      )}

      {widgetType === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Activity</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{(metricValue).toLocaleString()}</div>
            <span className="text-xs font-bold text-emerald-600 mt-2 inline-block">+14.2% from last week</span>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Users</span>
            <div className="text-3xl font-black text-indigo-600 mt-2">1,420</div>
            <span className="text-xs font-bold text-indigo-600 mt-2 inline-block">Online right now</span>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Status</span>
            <div className="text-3xl font-black text-emerald-600 mt-2">99.9%</div>
            <span className="text-xs font-bold text-slate-500 mt-2 inline-block">All systems operational</span>
          </div>
        </div>
      )}

      {widgetType === 'custom_code' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-xl text-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Executed Custom Code / API Module</span>
            </div>
            <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg">Status: Live Runtime</span>
          </div>
          <pre className="font-mono text-xs text-indigo-200 bg-slate-950 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
            {page.customCodeSnippet || '// No custom code snippet defined yet.'}
          </pre>
          <div className="mt-4 p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Custom function for <strong>{page.enLabel}</strong> compiled and rendered successfully. You can edit this code anytime via the Code Studio.</span>
          </div>
        </div>
      )}

      {widgetType === 'default' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{page.enLabel} Workspace</h3>
          <p className="text-slate-500 max-w-md mx-auto text-sm leading-relaxed mb-6">
            This is your newly created dynamic page module. You can customize its interactive widgets, add custom code functions, or change its permissions anytime.
          </p>
          {portalType === 'admin' && onOpenCodeStudio && (
            <button
              onClick={onOpenCodeStudio}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <Terminal className="w-4 h-4" /> Open Code & Widget Studio
            </button>
          )}
        </div>
      )}
    </div>
  );
}
