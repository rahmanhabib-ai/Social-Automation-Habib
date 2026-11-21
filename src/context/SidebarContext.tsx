import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  SectionColor,
  AnimationStyle,
  ActiveStyle,
  FontFamily,
  BrandThemeConfig,
  AIHubConfig,
  PaymentIntegrationsConfig,
  AutomationsConfig,
  SecurityRBACConfig,
  StorageBackupConfig,
  MarketingTrackingConfig,
  KeywordRule,
  HomepageConfig,
  NavItem,
  FeatureItem
} from '../types/controller';

export type { Role, SectionColor, AnimationStyle, ActiveStyle, FontFamily, HomepageConfig, NavItem, FeatureItem };

export const SYSTEM_SECTION_IDS = [
  'admin_dashboard_section',
  'admin-dashboard-section',
  'admin_panel',
  'admin-panel',
  'admin',
  'admin_panel_section',
  'admin-panel-section'
];

export const SYSTEM_PAGE_IDS = [
  'controller', 
  'sidebar_panel', 
  'sidebar_pages', 
  'message_gateway', 
  'whatsapp_gateway',
  'whatsapp_channels_groups',
  'whatsapp_hub',
  'channels_groups',
  'homepage', 
  'home'
];

export const isSystemSection = (section: any): boolean => {
  if (!section) return false;
  if (typeof section === 'string') {
    const sId = section.toLowerCase().trim();
    if (SYSTEM_SECTION_IDS.includes(sId)) return true;
    if (sId.includes('admin') || sId === 'controller') return true;
    return false;
  }
  const id = (section.id || '').toLowerCase().trim();
  const en = (section.enLabel || '').toLowerCase().trim();
  const bn = (section.bnLabel || '').toLowerCase().trim();
  
  if (SYSTEM_SECTION_IDS.includes(id) || id.includes('admin')) return true;
  if (en.includes('admin') || bn.includes('অ্যাডমিন') || bn.includes('এডমিন')) return true;
  if (Array.isArray(section.children) && section.children.some((c: any) => SYSTEM_PAGE_IDS.includes((c.id || '').toLowerCase().trim()))) {
    return true;
  }
  return false;
};

export const isSystemPage = (section: any, page: any): boolean => {
  const pageId = typeof page === 'string' ? page.toLowerCase().trim() : (page?.id || '').toLowerCase().trim();
  const pageEn = typeof page === 'object' ? (page?.enLabel || '').toLowerCase().trim() : '';
  const pageBn = typeof page === 'object' ? (page?.bnLabel || '').toLowerCase().trim() : '';

  if (SYSTEM_PAGE_IDS.includes(pageId)) return true;
  if (['controller', 'sidebar panel', 'sidebar pages', 'message gateway', 'whatsapp gateway', 'homepage', 'home'].includes(pageEn)) return true;
  if (['কন্ট্রোলার', 'সাইডবার প্যানেল', 'মেসেজ গেটওয়ে', 'হোমপেজ', 'হোম পেজ'].includes(pageBn)) return true;

  if (isSystemSection(section)) {
    return true;
  }
  return false;
};

export interface PageItem {
  id: string;
  enLabel: string;
  bnLabel: string;
  iconName: string;
  isLocked: boolean;
  roles: Role[];
  animationStyle?: AnimationStyle;
  enFont?: FontFamily;
  bnFont?: FontFamily;
  widgetType?: string;
  customCodeSnippet?: string;
  customDescription?: string;
}

export interface SidebarSection {
  id: string;
  enLabel: string;
  bnLabel: string;
  isLocked: boolean;
  roles: Role[];
  color: SectionColor;
  iconName: string;
  animationStyle?: AnimationStyle;
  activeStyle?: ActiveStyle;
  enFont?: FontFamily;
  bnFont?: FontFamily;
  children: PageItem[];
}

interface SidebarContextType {
  // Sidebar & Pages
  sections: SidebarSection[];
  setSections: React.Dispatch<React.SetStateAction<SidebarSection[]>>;
  lockMessage: string;
  setLockMessage: (msg: string) => void;
  updateSection: (id: string, updates: Partial<SidebarSection>) => void;
  renameSectionId: (oldId: string, newId: string) => boolean;
  moveSection: (index: number, direction: 'up' | 'down') => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  toggleLock: (id: string) => void;
  toggleChildLock: (sectionId: string, pageId: string) => void;
  addSection: () => void;
  addChildPage: (sectionId: string) => void;
  deleteChildPage: (sectionId: string, pageId: string) => void;
  updateChildPage: (sectionId: string, pageId: string, updates: Partial<PageItem>) => void;
  renameChildPageId: (sectionId: string, oldPageId: string, newPageId: string) => boolean;
  moveChildPage: (sectionId: string, pageIndex: number, direction: 'up' | 'down') => void;
  
  // Tab 1: Brand, Theme & UI Engine
  brandConfig: BrandThemeConfig;
  updateBrandConfig: (updates: Partial<BrandThemeConfig>) => void;

  // Tab 2: AI Hub
  aiConfig: AIHubConfig;
  updateAiConfig: (updates: Partial<AIHubConfig>) => void;

  // Tab 3: Payment & Integrations (without SMS)
  paymentConfig: PaymentIntegrationsConfig;
  updatePaymentConfig: (updates: Partial<PaymentIntegrationsConfig>) => void;

  // Tab 4: Automations & Triggers
  automationsConfig: AutomationsConfig;
  updateAutomationsConfig: (updates: Partial<AutomationsConfig>) => void;
  addKeywordRule: (rule: Omit<KeywordRule, 'id'>) => void;
  updateKeywordRule: (id: string, updates: Partial<KeywordRule>) => void;
  deleteKeywordRule: (id: string) => void;

  // Tab 5: Security & RBAC
  securityConfig: SecurityRBACConfig;
  updateSecurityConfig: (updates: Partial<SecurityRBACConfig>) => void;

  // Tab 6: Storage & Backup
  storageConfig: StorageBackupConfig;
  updateStorageConfig: (updates: Partial<StorageBackupConfig>) => void;
  triggerManualBackup: () => void;

  // Tab 7: Marketing & Tracking
  marketingConfig: MarketingTrackingConfig;
  updateMarketingConfig: (updates: Partial<MarketingTrackingConfig>) => void;

  // Tab 8: Homepage & Header/Footer Master Control
  homepageConfig: HomepageConfig;
  updateHomepageConfig: (updates: Partial<HomepageConfig>) => void;

  // Global Hub Actions
  saveToCloud: () => void;
  isSaving: boolean;
  exportAllConfigJSON: () => string;
  importAllConfigJSON: (jsonString: string) => boolean;
  resetToDefaults: () => void;
  restoreFromCloudSql: () => Promise<boolean>;
}

const defaultSections: SidebarSection[] = [
  {
    id: 'admin_dashboard_section',
    enLabel: 'Admin Panel',
    bnLabel: 'অ্যাডমিন প্যানেল',
    iconName: 'Shield',
    color: 'emerald',
    isLocked: false,
    roles: ['admin', 'manager'],
    children: [
      { id: 'controller', enLabel: 'Controller', bnLabel: 'কন্ট্রোলার', iconName: 'Sliders', isLocked: false, roles: ['admin'] },
      { id: 'sidebar_panel', enLabel: 'Sidebar Panel', bnLabel: 'সাইডবার প্যানেল', iconName: 'Layers', isLocked: false, roles: ['admin'] },
      { id: 'message_gateway', enLabel: 'Message Gateway', bnLabel: 'মেসেজ গেটওয়ে', iconName: 'MessageSquare', isLocked: false, roles: ['user', 'admin'], widgetType: 'message_gateway' },
      { id: 'homepage', enLabel: 'Homepage', bnLabel: 'হোমপেজ', iconName: 'Home', isLocked: false, roles: ['user', 'admin'] },
    ]
  },
  {
    id: 'inventory_section',
    enLabel: 'Inventory',
    bnLabel: 'ইনভেন্টরি',
    iconName: 'Package',
    color: 'amber',
    isLocked: true,
    roles: ['admin', 'manager', 'assistant_manager', 'sales_manager', 'sales_team', 'warehouse', 'user'],
    children: [
      { id: 'products', enLabel: 'Products List', bnLabel: 'প্রোডাক্ট লিস্ট', iconName: 'List', isLocked: false, roles: ['user', 'admin'] },
      { id: 'categories', enLabel: 'Categories', bnLabel: 'ক্যাটাগরি', iconName: 'Tags', isLocked: false, roles: ['user', 'admin'] },
    ]
  },
  { id: 'core', enLabel: 'Core', bnLabel: 'মূল ফিচার', iconName: 'Layers', isLocked: true, roles: ['user', 'admin'], color: 'blue', children: [] },
  { id: 'sales_crm_section', enLabel: 'Sales & CRM', bnLabel: 'সেলস ও সিআরএম', iconName: 'Briefcase', isLocked: true, roles: ['user', 'admin'], color: 'purple', children: [] },
  { id: 'accounting_section', enLabel: 'Accounting', bnLabel: 'হিসাব-নিকাশ', iconName: 'Calculator', isLocked: true, roles: ['admin', 'manager', 'assistant_manager', 'sales_manager', 'sales_team', 'user'], color: 'slate', children: [] },
  { 
    id: 'marketing_content_section', 
    enLabel: 'Social Media & WhatsApp', 
    bnLabel: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ', 
    iconName: 'Share2', 
    isLocked: false, 
    roles: ['admin', 'manager', 'assistant_manager', 'sales_manager', 'sales_team', 'user'], 
    color: 'rose', 
    children: [
      { id: 'create_schedule_post', enLabel: 'Create & Schedule Post', bnLabel: 'পোস্ট তৈরি ও শিডিউল', iconName: 'Send', isLocked: false, roles: ['user', 'admin'] },
      { id: 'spark_ai_scheduler', enLabel: 'Spark AI Campaign Scheduler', bnLabel: 'স্পার্ক এআই শিডিউলার', iconName: 'Sparkles', isLocked: false, roles: ['user', 'admin'] },
      { id: 'google_drive_spark', enLabel: 'Google Drive, Sheets & Docs Hub', bnLabel: 'গুগল ড্রাইভ, শিট ও ডক্স হাব', iconName: 'FolderGit2', isLocked: false, roles: ['user', 'admin'] },
      { id: 'whatsapp_channels_groups', enLabel: 'WhatsApp Channels & Groups Hub', bnLabel: 'হোয়াটসঅ্যাপ চ্যানেল ও গ্রুপ হাব', iconName: 'Radio', isLocked: false, roles: ['user', 'admin'], widgetType: 'whatsapp_channels_groups' },
      { id: 'auto_comment_dm', enLabel: 'Auto Comment & DM Rules', bnLabel: 'অটো কমেন্ট ও ডিএম রুলস', iconName: 'Bot', isLocked: false, roles: ['user', 'admin'] },
      { id: 'omnichannel_inbox', enLabel: 'Omnichannel Inbox & AI Agent', bnLabel: 'অমনি ইনবক্স ও এআই এজেন্ট', iconName: 'MessageSquare', isLocked: false, roles: ['user', 'admin'] },
      { id: 'platform_api_settings', enLabel: 'Platform API & WhatsApp Settings', bnLabel: 'প্ল্যাটফর্ম এপিআই ও হোয়াটসঅ্যাপ সেটিংস', iconName: 'Settings', isLocked: false, roles: ['user', 'admin'] }
    ] 
  },
  { id: 'store_builder_section', enLabel: 'Store Builder', bnLabel: 'স্টোর বিল্ডার', iconName: 'Store', isLocked: false, roles: ['admin'], color: 'rose', children: [] },
  { id: 'hrm_section', enLabel: 'HRM', bnLabel: 'এইচআরএম', iconName: 'Users', isLocked: true, roles: ['admin', 'manager', 'assistant_manager', 'user'], color: 'amber', children: [] },
  { 
    id: 'management_section', 
    enLabel: 'Management', 
    bnLabel: 'ব্যবস্থাপনা', 
    iconName: 'Sliders', 
    isLocked: false, 
    roles: ['admin'], 
    color: 'indigo', 
    children: [
      { id: 'role_user', enLabel: 'ROLE USER', bnLabel: 'রোল ও ইউজার', iconName: 'Users', isLocked: false, roles: ['admin'] },
      { id: 'google_analytics', enLabel: 'Google Analytics', bnLabel: 'অ্যানালিটিক্স', iconName: 'LineChart', isLocked: false, roles: ['user', 'admin'] },
      { id: 'excalidraw', enLabel: 'ExcaLidraw', bnLabel: 'এক্সক্যালাইড্র', iconName: 'PenTool', isLocked: false, roles: ['user', 'admin'] },
    ] 
  },
];

export const defaultBrandConfig: BrandThemeConfig = {
  siteNameEn: 'SmartPOS & Automation',
  siteNameBn: 'স্মার্ট পিওএস ও অটোমেশন',
  taglineEn: 'Unified Enterprise Operations & AI Platform',
  taglineBn: 'সমন্বিত এন্টারপ্রাইজ অপারেশন ও এআই প্ল্যাটফর্ম',
  logoUrl: '',
  darkLogoUrl: '',
  faviconUrl: '',
  homePageIcon: 'LayoutDashboard',
  homePageBadge: 'v2.5 Live',
  h1Font: 'font-sans',
  bodyFont: 'font-sans',
  fontScale: 'normal',
  fontWeight: '700',
  primaryColor: '#2563eb',
  surfaceTheme: 'light',
  borderRadius: '14px',
  buttonShadow: 'soft',
  buttonHoverEffect: 'scale',
  iconAlignment: 'left',
  sidebarMode: 'fixed',
  topbarSticky: true,
  containerWidth: 'fluid',
  showBreadcrumb: true,
  defaultLanguage: 'en',
  currency: 'BDT',
  timeFormat: '12h'
};

export const defaultAIConfig: AIHubConfig = {
  geminiApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
  claudeApiKey: '',
  claudeModel: 'claude-3-5-sonnet',
  deepseekApiKey: '',
  deepseekModel: 'deepseek-chat',
  taskRouting: {
    whatsappBot: 'gemini',
    contentWriter: 'claude',
    dataAnalysis: 'openai',
    imageGenerator: 'sharp-svg'
  },
  autoFallbackEnabled: true,
  systemPrompt: 'আপনি একজন নম্র, পেশাদার ও দ্রুত সহায়ক AI সহকারী। গ্রাহকের প্রতিটি প্রশ্নের উত্তর বাংলায় স্পষ্ট, নির্ভুল ও মিষ্টি ভাষায় প্রদান করুন।',
  aiTone: 'friendly',
  dailyTokenLimit: 50000,
  monthlyBudgetUsd: 25
};

export const defaultPaymentConfig: PaymentIntegrationsConfig = {
  bkashType: 'merchant',
  bkashNumber: '01700000000',
  bkashAppKey: '',
  bkashSecret: '',
  bkashUsername: '',
  bkashPassword: '',
  nagadType: 'merchant',
  nagadNumber: '01800000000',
  nagadMerchantId: '',
  nagadPublicKey: '',
  nagadPrivateKey: '',
  rocketType: 'personal',
  rocketNumber: '01900000000',
  sslcommerzStoreId: '',
  sslcommerzStorePassword: '',
  sslcommerzIsSandbox: true,
  epsMerchantId: '',
  epsSecretKey: '',
  stripePublishableKey: '',
  stripeSecretKey: '',
  paypalClientId: '',
  paypalSecretKey: '',
  emailProvider: 'smtp',
  smtpHost: 'smtp.gmail.com',
  smtpPort: '587',
  smtpUser: '',
  smtpPass: '',
  resendApiKey: '',
  fromEmail: 'no-reply@mybrand.com',
  fromName: 'Smart Commerce Notification',
  webhookUrl: 'https://mybrand.com/api/v1/webhook',
  webhookSecret: 'whsec_99371018374920',
  webhookEvents: ['order.created', 'order.shipped', 'payment.success']
};

export const defaultAutomationsConfig: AutomationsConfig = {
  autoSendInvoiceOnOrder: true,
  invoiceTemplate: 'প্রিয় {customer_name}, আপনার #{order_id} নং অর্ডারটি সফলভাবে গৃহীত হয়েছে। মোট মূল্য: {amount} টাকা। ইনভয়েস লিংক: {invoice_url}',
  autoSendTrackingOnShipped: true,
  courierPartner: 'steadfast',
  abandonedCartRecovery: true,
  abandonedCartDelayMinutes: 15,
  abandonedCartDiscountPercent: 5,
  keywordRules: [
    { id: '1', keyword: 'দাম কত', response: 'আমাদের সকল প্রডাক্টের দাম ও স্পেশাল অফার বিস্তারিত দেখতে আমাদের প্রোডাক্ট ক্যাটালগ ভিজিট করুন বা আপনার কাঙ্ক্ষিত পণ্যের নাম লিখুন।', matchType: 'contains', enabled: true },
    { id: '2', keyword: 'ডেলিভারি চার্জ', response: 'ঢাকার ভিতরে ডেলিভারি চার্জ ৬০ টাকা এবং ঢাকার বাইরে ১২০ টাকা। ক্যাশ অন ডেলিভারি প্রযোজ্য।', matchType: 'contains', enabled: true },
    { id: '3', keyword: 'ঠিকানা', response: 'আমাদের অফিস ও শোরুম: হাউস #১২, রোড #০৫, ধানমন্ডি, ঢাকা-১২০৯। প্রতিদিন সকাল ১০টা থেকে রাত ৮টা পর্যন্ত খোলা।', matchType: 'contains', enabled: true }
  ]
};

export const defaultSecurityConfig: SecurityRBACConfig = {
  rolePermissions: {
    admin: { view: true, create: true, edit: true, delete: true, export: true },
    manager: { view: true, create: true, edit: true, delete: false, export: true },
    assistant_manager: { view: true, create: true, edit: true, delete: false, export: false },
    sales_manager: { view: true, create: true, edit: true, delete: false, export: true },
    sales_team: { view: true, create: true, edit: false, delete: false, export: false },
    warehouse: { view: true, create: false, edit: true, delete: false, export: false },
    delivery_man: { view: true, create: false, edit: true, delete: false, export: false },
    user: { view: true, create: false, edit: false, delete: false, export: false },
  },
  requireWhatsApp2FA: true,
  sessionTimeoutMinutes: 60,
  ipWhitelist: '127.0.0.1, 103.145.10.0/24',
  countryBlockerEnabled: false,
  blockedCountries: ['RU', 'CN', 'KP'],
  auditLogs: [
    { id: '1', user: 'Admin (Super)', role: 'admin', action: 'System Config Updated', resource: 'Brand Theme Settings', timestamp: '12 Sep 2026, 04:30 PM', ip: '103.145.10.12' },
    { id: '2', user: 'Sales Lead', role: 'sales_manager', action: 'Exported Leads', resource: 'CRM Customers CSV', timestamp: '12 Sep 2026, 03:15 PM', ip: '103.145.10.45' },
    { id: '3', user: 'Warehouse Mgr', role: 'warehouse', action: 'Stock Inflow Updated', resource: 'Inventory #SKU-902', timestamp: '12 Sep 2026, 01:20 PM', ip: '103.145.10.88' },
  ]
};

export const defaultStorageConfig: StorageBackupConfig = {
  storageProvider: 's3',
  s3Bucket: 'smartpos-media-bucket-live',
  s3Region: 'ap-southeast-1',
  s3AccessKey: 'AKIA...SAMPLEKEY',
  s3SecretKey: '••••••••••••••••••••••••••••••',
  customCdnDomain: 'https://cdn.mybrand.com',
  autoBackupEnabled: true,
  backupFrequency: 'daily',
  backupTime: '00:00',
  backupNotificationEmail: 'admin@mybrand.com',
  backupHistory: [
    { id: '1', name: 'smartpos_backup_daily_2026-09-12.sql.gz', size: '14.8 MB', timestamp: '12 Sep 2026, 00:00 AM', status: 'completed' },
    { id: '2', name: 'smartpos_backup_daily_2026-09-11.sql.gz', size: '14.5 MB', timestamp: '11 Sep 2026, 00:00 AM', status: 'completed' },
    { id: '3', name: 'smartpos_backup_daily_2026-09-10.sql.gz', size: '14.1 MB', timestamp: '10 Sep 2026, 00:00 AM', status: 'completed' }
  ]
};

export const defaultMarketingConfig: MarketingTrackingConfig = {
  // Google SEO & Ranking Master Suite
  seoTitleEn: 'SmartPOS & Automation — Modern Cloud POS, Pharmacy, Restaurant & Enterprise Platform',
  seoTitleBn: 'স্মার্ট পিওএস ও অটোমেশন — ক্লাউড পিওএস, ফার্মেসি, রেস্টুরেন্ট ও এন্টারপ্রাইজ সিস্টেম',
  seoMetaDescriptionEn: 'All-in-one AI powered enterprise POS, inventory, pharmacy, restaurant, order management, and WhatsApp message gateway platform.',
  seoMetaDescriptionBn: 'স্মার্ট পিওএস, ফার্মেসি, রেস্টুরেন্ট ম্যানেজমেন্ট, ইনভেন্টরি কন্ট্রোল, হোয়াটসঅ্যাপ মেসেজ গেটওয়ে ও এআই অটোমেশন প্ল্যাটফর্ম।',
  seoTargetKeywordsEn: 'Smart POS, cloud pos software, pharmacy pos system, restaurant pos bangladesh, enterprise erp, whatsapp message gateway, ai pos billing',
  seoTargetKeywordsBn: 'স্মার্ট পিওএস, ফার্মেসি সফটওয়্যার, রেস্টুরেন্ট বিলিং সিস্টেম, ইনভেন্টরি ম্যানেজমেন্ট, মেসেজ গেটওয়ে, অটোমেশন',
  seoCanonicalUrl: '',
  seoRobotsDirective: 'index, follow',
  seoAuthorOrPublisher: 'SmartPOS Enterprise Solutions',
  googleSiteVerificationTag: 'google-site-verification=abc9981273928173921',
  bingSiteVerificationTag: '',
  sitemapXmlUrl: '/sitemap.xml',
  googleSearchConsoleUrl: 'https://search.google.com/search-console',
  enableStructuredSchema: true,
  schemaBusinessType: 'SoftwareApplication',

  // Pixels & Analytics
  metaPixelId: '982736481029384',
  metaCapiToken: 'EAAG...sample_meta_capi_token_xyz9812',
  metaTestEventCode: 'TEST98231',
  gtmContainerId: 'GTM-TX982PL',
  ga4MeasurementId: 'G-772910482',
  tiktokPixelId: 'C78921KLMOP0',
  clarityProjectId: 'k992810',
  pinterestTagId: '',
  headerCode: '<!-- Custom Header Scripts -->',
  bodyCode: '<!-- Custom Body Start Scripts -->',
  footerCode: '<!-- Custom Footer / Chatbot Scripts -->'
};

export const defaultHomepageConfig: HomepageConfig = {
  header: {
    brandTitle: 'Smart Commerce Enterprise',
    brandSubtitle: 'Unified Operating System',
    showLogoIcon: true,
    navLinks: [
      { id: '1', label: 'Home', href: '#hero', isVisible: true },
      { id: '2', label: 'Portals', href: '#portals', isVisible: true },
      { id: '3', label: 'About', href: '#about', isVisible: true },
      { id: '4', label: 'Features', href: '#features', isVisible: true },
      { id: '5', label: 'Contact', href: '#contact', isVisible: true }
    ],
    showUserLoginBtn: true,
    userLoginBtnText: 'User Login',
    showAdminLoginBtn: false,
    adminLoginBtnText: 'Admin Portal 🔒'
  },
  hero: {
    showHero: true,
    badgeText: '✨ Next-Generation Enterprise Management Platform',
    headline: 'Manage Your Entire Business & Operations in One Unified System',
    subtext: 'Smart inventory, Sales & CRM, AI automation, real-time message gateway, and multi-role access control—all within one scalable cloud platform.',
    primaryBtnText: 'Access User Portal',
    primaryBtnAction: 'user_login',
    secondaryBtnText: 'Explore Platform',
    secondaryBtnAction: 'user_login',
    highlights: ['⚡ Instant Cloud Sync & Ultra-Fast', '🔒 Enterprise-Grade Security', '📱 Fully Mobile & Desktop Ready']
  },
  portals: {
    showPortals: true,
    badgeText: 'Centralized Architecture',
    sectionTitle: 'Dedicated System Portals',
    sectionSubtitle: 'Select your workspace based on your responsibilities and team role',
    showUserPortalCard: true,
    userPortalTitle: 'User & Client Portal',
    userPortalDesc: 'Daily sales transactions, customer service, inventory browsing, messaging, and reporting.',
    userPortalFeatures: ['Product Catalog & Order Management', 'Real-time Message Gateway & Chatbot', 'Marketing Content & Sales Pipeline', 'Personalized Team Workspace'],
    showAdminPortalCard: false,
    adminPortalTitle: 'Super Admin & Controller Hub',
    adminPortalDesc: 'Full system configuration, dynamic sidebar & page builder, role permissions, and AI integration.',
    adminPortalFeatures: ['Sidebar & page drag/order/edit', 'Homepage & header-footer live control', 'AI keys & payment gateway setup', 'Role permissions & IP security']
  },
  about: {
    showAbout: true,
    badgeText: 'Platform Overview',
    headline: 'Complete Cloud Solution for Scalable Business Growth',
    description: 'Our platform provides businesses of any scale with an end-to-end operational hub. Effortlessly unify sales, customer support, inventory, and real-time operations under a single high-performance engine.',
    stat1Number: '100%',
    stat1Label: 'Cloud Automation',
    stat1Sub: 'Zero-config & instant sync',
    stat2Number: '99.9%',
    stat2Label: 'System Availability',
    stat2Sub: 'Enterprise SLA guaranteed',
    systemHealthText: 'All Services Operational • 99.99% Uptime'
  },
  features: {
    showFeatures: true,
    badgeText: 'Core Technology',
    headline: 'Powerful Features & Modern Modules',
    subtitle: 'Designed to ensure optimal speed, intelligence, and precision across every workflow',
    items: [
      { id: '1', icon: 'Sliders', title: 'Dynamic Page & Workflow Engine', description: 'Customize navigation, landing modules, and role permissions directly from the controller.' },
      { id: '2', icon: 'Shield', title: 'Role-Based Access Control (RBAC)', description: 'Dedicated access levels and security rules for managers, sales teams, and customer accounts.' },
      { id: '3', icon: 'Bot', title: 'Smart Message Gateway & AI', description: 'Automated WhatsApp messaging, order status alerts, and customer query resolutions.' },
      { id: '4', icon: 'Zap', title: 'Real-Time Cloud Synchronization', description: 'Every operational configuration and inventory update reflects immediately across all terminals.' },
      { id: '5', icon: 'Lock', title: 'Cloud Backup & Audit Trails', description: 'Automated daily backups, export/import options, and detailed user activity audit logs.' },
      { id: '6', icon: 'Globe', title: 'Universal Multi-Device Layout', description: 'Flawlessly responsive across smartphones, tablets, POS hardware, and desktop workstations.' }
    ]
  },
  contact: {
    showContact: true,
    badgeText: 'Support & Inquiries',
    headline: 'We Are Here to Support Your Business Growth',
    subtitle: 'Have a question, customization inquiry, or require technical support? Contact our team.',
    email: 'support@smartcommerce.app',
    phone: '+880 1700-000000',
    address: 'Level 5, Gulshan-2, Dhaka 1212, Bangladesh',
    showForm: true
  },
  footer: {
    brandTitle: 'Smart Commerce Enterprise OS',
    brandDesc: 'Next-generation enterprise operations, real-time messaging, and cloud management solution.',
    copyrightText: '© 2026 Smart Commerce Enterprise. All rights reserved.',
    statusText: 'All Systems Online & Operational'
  }
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [sections, setSections] = useState<SidebarSection[]>(defaultSections);
  const [lockMessage, setLockMessage] = useState('দুঃখিত, এই সেকশনটি বর্তমানে অ্যাডমিন কর্তৃক লক করা রয়েছে!');
  const [brandConfig, setBrandConfig] = useState<BrandThemeConfig>(defaultBrandConfig);
  const [aiConfig, setAiConfig] = useState<AIHubConfig>(defaultAIConfig);
  const [paymentConfig, setPaymentConfig] = useState<PaymentIntegrationsConfig>(defaultPaymentConfig);
  const [automationsConfig, setAutomationsConfig] = useState<AutomationsConfig>(defaultAutomationsConfig);
  const [securityConfig, setSecurityConfig] = useState<SecurityRBACConfig>(defaultSecurityConfig);
  const [storageConfig, setStorageConfig] = useState<StorageBackupConfig>(defaultStorageConfig);
  const [marketingConfig, setMarketingConfig] = useState<MarketingTrackingConfig>(defaultMarketingConfig);
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(defaultHomepageConfig);
  const [isSaving, setIsSaving] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedSections = localStorage.getItem('sidebar_config');
      if (savedSections) {
        let parsed = JSON.parse(savedSections) as SidebarSection[];
        // Ensure admin section has both controller and sidebar_panel
        const adminSec = parsed.find(s => s.id === 'admin_dashboard_section');
        if (adminSec) {
          const hasController = adminSec.children.some(c => c.id === 'controller');
          const hasSidebarPanel = adminSec.children.some(c => c.id === 'sidebar_panel' || c.id === 'sidebar_pages');
          const hasMessageGateway = adminSec.children.some(c => c.id === 'message_gateway' || c.id === 'whatsapp_gateway');
          const hasHomepage = adminSec.children.some(c => c.id === 'homepage' || c.id === 'home');
          
          if (!hasController) {
            adminSec.children.unshift({ id: 'controller', enLabel: 'Controller', bnLabel: 'কন্ট্রোলার', iconName: 'Sliders', isLocked: false, roles: ['admin'] });
          }
          if (!hasSidebarPanel) {
            adminSec.children.splice(1, 0, { id: 'sidebar_panel', enLabel: 'Sidebar Panel', bnLabel: 'সাইডবার প্যানেল', iconName: 'Layers', isLocked: false, roles: ['admin'] });
          } else {
            // Ensure proper labeling if it was sidebar_pages
            const spItem = adminSec.children.find(c => c.id === 'sidebar_panel' || c.id === 'sidebar_pages');
            if (spItem) {
              spItem.enLabel = 'Sidebar Panel';
              spItem.bnLabel = 'সাইডবার প্যানেল';
              spItem.iconName = 'Layers';
            }
          }

          // Migrate whatsapp_gateway to message_gateway
          const wgItem = adminSec.children.find(c => c.id === 'whatsapp_gateway');
          if (wgItem) {
            wgItem.id = 'message_gateway';
            wgItem.enLabel = 'Message Gateway';
            wgItem.bnLabel = 'মেসেজ গেটওয়ে';
            wgItem.widgetType = 'message_gateway';
          } else if (!hasMessageGateway) {
            adminSec.children.splice(2, 0, { id: 'message_gateway', enLabel: 'Message Gateway', bnLabel: 'মেসেজ গেটওয়ে', iconName: 'MessageSquare', isLocked: false, roles: ['user', 'admin'], widgetType: 'message_gateway' });
          }

          if (!hasHomepage) {
            adminSec.children.splice(3, 0, { id: 'homepage', enLabel: 'Homepage', bnLabel: 'হোমপেজ', iconName: 'Home', isLocked: false, roles: ['user', 'admin'] });
          }

          // Move any non-system items from admin section to management section
          const nonSystemItems = adminSec.children.filter(c => !SYSTEM_PAGE_IDS.includes(c.id));
          if (nonSystemItems.length > 0) {
            adminSec.children = adminSec.children.filter(c => SYSTEM_PAGE_IDS.includes(c.id));
            let mgmtSec = parsed.find(s => s.id === 'management_section');
            if (mgmtSec) {
              for (const item of nonSystemItems) {
                if (!mgmtSec.children.some(c => c.id === item.id)) {
                  mgmtSec.children.push(item);
                }
              }
            }
          }
        }

        // Clean any unwanted social sections
        const filteredParsed = parsed.filter(s => s.id !== 'social_media_section' && s.id !== 'social_media_manager');

        // Ensure marketing_content_section is labeled Social Media & WhatsApp and has all 5 features
        let marketingSec = filteredParsed.find(s => s.id === 'marketing_content_section');
        if (!marketingSec) {
          marketingSec = {
            id: 'marketing_content_section',
            enLabel: 'Social Media & WhatsApp',
            bnLabel: 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ',
            iconName: 'Share2',
            isLocked: false,
            roles: ['admin', 'manager', 'assistant_manager', 'sales_manager', 'sales_team', 'user'],
            color: 'rose',
            children: [
              { id: 'create_schedule_post', enLabel: 'Create & Schedule Post', bnLabel: 'পোস্ট তৈরি ও শিডিউল', iconName: 'Send', isLocked: false, roles: ['user', 'admin'] },
              { id: 'whatsapp_channels_groups', enLabel: 'WhatsApp Channels & Groups Hub', bnLabel: 'হোয়াটসঅ্যাপ চ্যানেল ও গ্রুপ হাব', iconName: 'Radio', isLocked: false, roles: ['user', 'admin'], widgetType: 'whatsapp_channels_groups' },
              { id: 'auto_comment_dm', enLabel: 'Auto Comment & DM Rules', bnLabel: 'অটো কমেন্ট ও ডিএম রুলস', iconName: 'Bot', isLocked: false, roles: ['user', 'admin'] },
              { id: 'omnichannel_inbox', enLabel: 'Omnichannel Inbox & AI Agent', bnLabel: 'অমনি ইনবক্স ও এআই এজেন্ট', iconName: 'MessageSquare', isLocked: false, roles: ['user', 'admin'] },
              { id: 'platform_api_settings', enLabel: 'Platform API & WhatsApp Settings', bnLabel: 'প্ল্যাটফর্ম এপিআই ও হোয়াটসঅ্যাপ সেটিংস', iconName: 'Settings', isLocked: false, roles: ['user', 'admin'] }
            ]
          };
          filteredParsed.splice(5, 0, marketingSec);
        } else {
          marketingSec.isLocked = false;
          marketingSec.enLabel = 'Social Media & WhatsApp';
          marketingSec.bnLabel = 'সোশ্যাল মিডিয়া ও হোয়াটসঅ্যাপ';
          marketingSec.iconName = 'Share2';
          
          if (!marketingSec.children.some(c => c.id === 'create_schedule_post')) {
            marketingSec.children.push({
              id: 'create_schedule_post',
              enLabel: 'Create & Schedule Post',
              bnLabel: 'পোস্ট তৈরি ও শিডিউল',
              iconName: 'Send',
              isLocked: false,
              roles: ['user', 'admin']
            });
          }
          if (!marketingSec.children.some(c => c.id === 'spark_ai_scheduler')) {
            marketingSec.children.push({
              id: 'spark_ai_scheduler',
              enLabel: 'Spark AI Campaign Scheduler',
              bnLabel: 'স্পার্ক এআই শিডিউলার',
              iconName: 'Sparkles',
              isLocked: false,
              roles: ['user', 'admin']
            });
          }
          if (!marketingSec.children.some(c => c.id === 'google_drive_spark')) {
            marketingSec.children.push({
              id: 'google_drive_spark',
              enLabel: 'Google Drive, Sheets & Docs Hub',
              bnLabel: 'গুগল ড্রাইভ, শিট ও ডক্স হাব',
              iconName: 'FolderGit2',
              isLocked: false,
              roles: ['user', 'admin']
            });
          } else {
            const driveItem = marketingSec.children.find(c => c.id === 'google_drive_spark');
            if (driveItem) {
              driveItem.enLabel = 'Google Drive, Sheets & Docs Hub';
              driveItem.bnLabel = 'গুগল ড্রাইভ, শিট ও ডক্স হাব';
            }
          }
          if (!marketingSec.children.some(c => c.id === 'whatsapp_channels_groups' || c.id === 'whatsapp_hub' || c.id === 'channels_groups')) {
            marketingSec.children.push({
              id: 'whatsapp_channels_groups',
              enLabel: 'WhatsApp Channels & Groups Hub',
              bnLabel: 'হোয়াটসঅ্যাপ চ্যানেল ও গ্রুপ হাব',
              iconName: 'Radio',
              isLocked: false,
              roles: ['user', 'admin'],
              widgetType: 'whatsapp_channels_groups'
            });
          }
          if (!marketingSec.children.some(c => c.id === 'auto_comment_dm')) {
            marketingSec.children.push({
              id: 'auto_comment_dm',
              enLabel: 'Auto Comment & DM Rules',
              bnLabel: 'অটো কমেন্ট ও ডিএম রুলস',
              iconName: 'Bot',
              isLocked: false,
              roles: ['user', 'admin']
            });
          }
          if (!marketingSec.children.some(c => c.id === 'omnichannel_inbox')) {
            marketingSec.children.push({
              id: 'omnichannel_inbox',
              enLabel: 'Omnichannel Inbox & AI Agent',
              bnLabel: 'অমনি ইনবক্স ও এআই এজেন্ট',
              iconName: 'MessageSquare',
              isLocked: false,
              roles: ['user', 'admin']
            });
          }
          if (!marketingSec.children.some(c => c.id === 'platform_api_settings')) {
            marketingSec.children.push({
              id: 'platform_api_settings',
              enLabel: 'Platform API & WhatsApp Settings',
              bnLabel: 'প্ল্যাটফর্ম এপিআই ও হোয়াটসঅ্যাপ সেটিংস',
              iconName: 'Settings',
              isLocked: false,
              roles: ['user', 'admin']
            });
          }
        }

        localStorage.setItem('sidebar_config', JSON.stringify(filteredParsed));
        setSections(filteredParsed);
      }

      const savedMsg = localStorage.getItem('lock_message');
      if (savedMsg) setLockMessage(savedMsg);

      const savedBrand = localStorage.getItem('app_brand_config');
      if (savedBrand) setBrandConfig(prev => ({ ...prev, ...JSON.parse(savedBrand) }));

      const savedAi = localStorage.getItem('app_ai_config');
      if (savedAi) setAiConfig(prev => ({ ...prev, ...JSON.parse(savedAi) }));

      const savedPayment = localStorage.getItem('app_payment_config');
      if (savedPayment) setPaymentConfig(prev => ({ ...prev, ...JSON.parse(savedPayment) }));

      const savedAutomations = localStorage.getItem('app_automations_config');
      if (savedAutomations) setAutomationsConfig(prev => ({ ...prev, ...JSON.parse(savedAutomations) }));

      const savedSecurity = localStorage.getItem('app_security_config');
      if (savedSecurity) setSecurityConfig(prev => ({ ...prev, ...JSON.parse(savedSecurity) }));

      const savedStorage = localStorage.getItem('app_storage_config');
      if (savedStorage) setStorageConfig(prev => ({ ...prev, ...JSON.parse(savedStorage) }));

      const savedMarketing = localStorage.getItem('app_marketing_config');
      if (savedMarketing) setMarketingConfig(prev => ({ ...prev, ...JSON.parse(savedMarketing) }));

      const savedHomepage = localStorage.getItem('app_homepage_config');
      if (savedHomepage) setHomepageConfig(prev => ({ ...prev, ...JSON.parse(savedHomepage) }));
    } catch (e) {
      console.error("Failed to load saved configurations", e);
    }

    // Auto-fetch from Cloud SQL (Guarantees data persistence across hard resets or cache clears)
    (async () => {
      try {
        const res = await fetch('/api/system/configs');
        const data = await res.json();
        if (data.success && data.configs && Object.keys(data.configs).length > 0) {
          const c = data.configs;
          const hasLocal = !!localStorage.getItem('sidebar_config');
          // If local storage was cleared or empty, restore all modules from Cloud SQL
          if (!hasLocal && c.sidebar_config) {
            try {
              setSections(JSON.parse(c.sidebar_config));
              localStorage.setItem('sidebar_config', c.sidebar_config);
            } catch {}
          }
          if (!hasLocal && c.lock_message) {
            setLockMessage(c.lock_message);
            localStorage.setItem('lock_message', c.lock_message);
          }
          if (!hasLocal && c.app_brand_config) {
            try {
              setBrandConfig(JSON.parse(c.app_brand_config));
              localStorage.setItem('app_brand_config', c.app_brand_config);
            } catch {}
          }
          if (!hasLocal && c.app_ai_config) {
            try {
              setAiConfig(JSON.parse(c.app_ai_config));
              localStorage.setItem('app_ai_config', c.app_ai_config);
            } catch {}
          }
          if (!hasLocal && c.app_payment_config) {
            try {
              setPaymentConfig(JSON.parse(c.app_payment_config));
              localStorage.setItem('app_payment_config', c.app_payment_config);
            } catch {}
          }
          if (!hasLocal && c.app_automations_config) {
            try {
              setAutomationsConfig(JSON.parse(c.app_automations_config));
              localStorage.setItem('app_automations_config', c.app_automations_config);
            } catch {}
          }
          if (!hasLocal && c.app_security_config) {
            try {
              setSecurityConfig(JSON.parse(c.app_security_config));
              localStorage.setItem('app_security_config', c.app_security_config);
            } catch {}
          }
          if (!hasLocal && c.app_storage_config) {
            try {
              setStorageConfig(JSON.parse(c.app_storage_config));
              localStorage.setItem('app_storage_config', c.app_storage_config);
            } catch {}
          }
          if (!hasLocal && c.app_marketing_config) {
            try {
              setMarketingConfig(JSON.parse(c.app_marketing_config));
              localStorage.setItem('app_marketing_config', c.app_marketing_config);
            } catch {}
          }
          if (!hasLocal && c.app_homepage_config) {
            try {
              setHomepageConfig(JSON.parse(c.app_homepage_config));
              localStorage.setItem('app_homepage_config', c.app_homepage_config);
            } catch {}
          }
        }
      } catch (err) {
        console.warn('[Cloud SQL] Automatic sync error:', err);
      }
    })();
  }, []);

  // Dynamically synchronize Browser Title, Meta Tags, and Favicon based on Brand Configuration
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Dynamic Browser Document Title
    const titleText = marketingConfig.seoTitleEn || (brandConfig.siteNameBn && brandConfig.siteNameEn
      ? `${brandConfig.siteNameEn} — ${brandConfig.siteNameBn}`
      : (brandConfig.siteNameEn || brandConfig.siteNameBn || 'SmartPOS & Automation'));
    
    document.title = titleText;

    // 2. Dynamic OpenGraph and Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    const descContent = marketingConfig.seoMetaDescriptionEn || brandConfig.taglineEn || brandConfig.taglineBn || 'Unified Enterprise Operations & AI Platform';
    if (metaDesc) {
      metaDesc.setAttribute('content', descContent);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', titleText);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', descContent);
    }

    // Dynamic Meta Keywords
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', marketingConfig.seoTargetKeywordsEn || 'smart pos, billing software, bangladesh cloud pos');

    // Dynamic Robots Meta
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', marketingConfig.seoRobotsDirective || 'index, follow');

    // Dynamic Google Site Verification
    if (marketingConfig.googleSiteVerificationTag) {
      let gsvMeta = document.querySelector('meta[name="google-site-verification"]');
      if (!gsvMeta) {
        gsvMeta = document.createElement('meta');
        gsvMeta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(gsvMeta);
      }
      const cleanToken = marketingConfig.googleSiteVerificationTag.replace('google-site-verification=', '').trim();
      gsvMeta.setAttribute('content', cleanToken);
    }

    // Dynamic JSON-LD Structured Data Schema Markup (Google Rich Snippets)
    let schemaScript = document.getElementById('seo-json-ld') as HTMLScriptElement;
    if (!schemaScript && marketingConfig.enableStructuredSchema) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'seo-json-ld';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    if (schemaScript && marketingConfig.enableStructuredSchema) {
      const origin = window.location.origin;
      const structuredData = {
        "@context": "https://schema.org",
        "@type": marketingConfig.schemaBusinessType || "SoftwareApplication",
        "name": brandConfig.siteNameEn || "SmartPOS & Automation",
        "alternateName": brandConfig.siteNameBn,
        "description": descContent,
        "url": origin,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All",
        "keywords": marketingConfig.seoTargetKeywordsEn,
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "BDT"
        }
      };
      schemaScript.text = JSON.stringify(structuredData);
    }

    // 3. Dynamic Favicon Generator & Synchronization
    let faviconEl = document.getElementById('app-favicon') as HTMLLinkElement;
    if (!faviconEl) {
      faviconEl = document.createElement('link') as HTMLLinkElement;
      faviconEl.id = 'app-favicon';
      faviconEl.rel = 'icon';
      document.head.appendChild(faviconEl);
    }

    if (brandConfig.faviconUrl && brandConfig.faviconUrl.trim()) {
      // User provided explicit Favicon URL
      faviconEl.type = 'image/x-icon';
      faviconEl.href = brandConfig.faviconUrl.trim();
    } else if (brandConfig.logoUrl && brandConfig.logoUrl.trim()) {
      // Fallback to uploaded Logo URL
      faviconEl.type = 'image/png';
      faviconEl.href = brandConfig.logoUrl.trim();
    } else {
      // Generate clean high-resolution SVG favicon on-the-fly based on selected Home/Brand Icon & Primary Color
      const primaryHex = encodeURIComponent(brandConfig.primaryColor || '#2563eb');
      
      // Crisp vector icon shapes for key categories
      let svgPath = `<rect width='7' height='9' x='3' y='3' rx='1'/><rect width='7' height='5' x='14' y='3' rx='1'/><rect width='7' height='9' x='14' y='12' rx='1'/><rect width='7' height='5' x='3' y='16' rx='1'/>`; // default layout dashboard
      
      const iconKey = (brandConfig.homePageIcon || '').toLowerCase();
      if (iconKey.includes('pill')) {
        svgPath = `<path d='m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z'/><path d='m8.5 8.5 7 7'/>`;
      } else if (iconKey.includes('store') || iconKey.includes('shop')) {
        svgPath = `<path d='m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7'/><path d='M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8'/><path d='M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4'/><path d='M2 7h20'/>`;
      } else if (iconKey.includes('utensil') || iconKey.includes('food') || iconKey.includes('restaurant')) {
        svgPath = `<path d='M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2'/><path d='M15 2v10a2 2 0 0 1-2 2v8'/><path d='M6 2v20'/><path d='M6 6h4'/><path d='M6 10h4'/>`;
      } else if (iconKey.includes('trend') || iconKey.includes('growth') || iconKey.includes('chart')) {
        svgPath = `<polyline points='22 7 13.5 15.5 8.5 10.5 2 17'/><polyline points='16 7 22 7 22 13'/>`;
      } else if (iconKey.includes('cart') || iconKey.includes('bag')) {
        svgPath = `<circle cx='8' cy='21' r='1'/><circle cx='19' cy='21' r='1'/><path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12'/>`;
      } else if (iconKey.includes('rocket')) {
        svgPath = `<path d='M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z'/><path d='m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z'/>`;
      }

      faviconEl.type = 'image/svg+xml';
      faviconEl.href = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${primaryHex}' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'>${svgPath}</svg>`;
    }
  }, [brandConfig.siteNameEn, brandConfig.siteNameBn, brandConfig.taglineEn, brandConfig.taglineBn, brandConfig.faviconUrl, brandConfig.logoUrl, brandConfig.homePageIcon, brandConfig.primaryColor]);

  // Updaters
  const updateSection = (id: string, updates: Partial<SidebarSection>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const renameSectionId = (oldId: string, newId: string): boolean => {
    if (isSystemSection(oldId)) return false;
    const cleanId = newId.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!cleanId) return false;
    let success = false;
    setSections(prev => {
      // Check if newId already exists in another section
      if (prev.some(s => s.id === cleanId && s.id !== oldId)) {
        return prev;
      }
      success = true;
      return prev.map(s => s.id === oldId ? { ...s, id: cleanId } : s);
    });
    return success;
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) return;
    setSections(prev => {
      const newSections = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      return newSections;
    });
  };

  const deleteSection = (id: string) => {
    if (isSystemSection(id)) return;
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const duplicateSection = (id: string) => {
    if (isSystemSection(id)) return;
    setSections(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index === -1) return prev;
      const original = prev[index];
      const newEnLabel = `${original.enLabel} (Copy)`;
      const baseId = newEnLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const uniqueSuffix = Math.random().toString(36).substring(2,6);

      const newSection: SidebarSection = {
        ...original,
        id: `${baseId}-${uniqueSuffix}`,
        enLabel: newEnLabel,
        bnLabel: `${original.bnLabel} (কপি)`,
        children: original.children.map(c => {
          const childLabel = `${c.enLabel} (Copy)`;
          const childBaseId = childLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          return {
            ...c,
            enLabel: childLabel,
            id: `${childBaseId}-${Math.random().toString(36).substring(2,6)}`
          };
        })
      };
      const newSections = [...prev];
      newSections.splice(index + 1, 0, newSection);
      return newSections;
    });
  };

  const toggleLock = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, isLocked: !s.isLocked } : s));
  };

  const toggleChildLock = (sectionId: string, pageId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, children: s.children.map(p => p.id === pageId ? { ...p, isLocked: !p.isLocked } : p) };
      }
      return s;
    }));
  };

  const addSection = () => {
    const timestamp = Date.now();
    const enLabel = 'New Section';
    const newId = `section_${timestamp}`;
    const newPageId = `page_${timestamp}`;
    const newSection: SidebarSection = {
      id: newId,
      enLabel,
      bnLabel: 'নতুন সেকশন',
      iconName: 'Folder',
      color: 'indigo',
      isLocked: false,
      roles: ['admin', 'user'],
      children: [
        {
          id: newPageId,
          enLabel: 'Overview',
          bnLabel: 'ওভারভিউ',
          iconName: 'FileText',
          isLocked: false,
          roles: ['admin', 'user'],
          widgetType: 'default'
        }
      ]
    };
    setSections(prev => [...prev, newSection]);
  };

  const addChildPage = (sectionId: string) => {
    if (isSystemSection(sectionId)) return;
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        const enLabel = 'New Page';
        const newId = `page_${Date.now()}`;
        const newPage: PageItem = { 
          id: newId, 
          enLabel, 
          bnLabel: 'নতুন পেজ', 
          iconName: 'FileText', 
          isLocked: false, 
          roles: ['admin', 'user'],
          widgetType: 'default'
        };
        return { ...s, children: [...(s.children || []), newPage] };
      }
      return s;
    }));
  };

  const deleteChildPage = (sectionId: string, pageId: string) => {
    if (isSystemPage(sectionId, pageId) || (isSystemSection(sectionId) && SYSTEM_PAGE_IDS.includes(pageId))) {
      return;
    }
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, children: s.children.filter(p => p.id !== pageId) };
      }
      return s;
    }));
  };

  const updateChildPage = (sectionId: string, pageId: string, updates: Partial<PageItem>) => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        return { ...s, children: s.children.map(p => p.id === pageId ? { ...p, ...updates } : p) };
      }
      return s;
    }));
  };

  const renameChildPageId = (sectionId: string, oldPageId: string, newPageId: string): boolean => {
    if (isSystemPage(sectionId, oldPageId) || (isSystemSection(sectionId) && SYSTEM_PAGE_IDS.includes(oldPageId))) {
      return false;
    }
    const cleanId = newPageId.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!cleanId) return false;
    let success = false;
    setSections(prev => {
      // Check if another page in any section has this same pageId
      const existsElsewhere = prev.some(s => s.children.some(p => p.id === cleanId && p.id !== oldPageId));
      if (existsElsewhere) {
        return prev;
      }
      success = true;
      return prev.map(s => {
        if (s.id === sectionId) {
          return {
            ...s,
            children: s.children.map(p => p.id === oldPageId ? { ...p, id: cleanId } : p)
          };
        }
        return s;
      });
    });
    return success;
  };

  const moveChildPage = (sectionId: string, pageIndex: number, direction: 'up' | 'down') => {
    setSections(prev => prev.map(s => {
      if (s.id === sectionId) {
        if ((direction === 'up' && pageIndex === 0) || (direction === 'down' && pageIndex === s.children.length - 1)) return s;
        const newChildren = [...s.children];
        const targetIndex = direction === 'up' ? pageIndex - 1 : pageIndex + 1;
        [newChildren[pageIndex], newChildren[targetIndex]] = [newChildren[targetIndex], newChildren[pageIndex]];
        return { ...s, children: newChildren };
      }
      return s;
    }));
  };

  // Modular Updaters
  const updateBrandConfig = (updates: Partial<BrandThemeConfig>) => {
    setBrandConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_brand_config', JSON.stringify(next));
      return next;
    });
  };

  const updateAiConfig = (updates: Partial<AIHubConfig>) => {
    setAiConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_ai_config', JSON.stringify(next));
      return next;
    });
  };

  const updatePaymentConfig = (updates: Partial<PaymentIntegrationsConfig>) => {
    setPaymentConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_payment_config', JSON.stringify(next));
      return next;
    });
  };

  const updateAutomationsConfig = (updates: Partial<AutomationsConfig>) => {
    setAutomationsConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_automations_config', JSON.stringify(next));
      return next;
    });
  };

  const addKeywordRule = (rule: Omit<KeywordRule, 'id'>) => {
    setAutomationsConfig(prev => {
      const newRule: KeywordRule = { ...rule, id: `kw_${Date.now()}` };
      const next = { ...prev, keywordRules: [...prev.keywordRules, newRule] };
      localStorage.setItem('app_automations_config', JSON.stringify(next));
      return next;
    });
  };

  const updateKeywordRule = (id: string, updates: Partial<KeywordRule>) => {
    setAutomationsConfig(prev => {
      const next = {
        ...prev,
        keywordRules: prev.keywordRules.map(r => r.id === id ? { ...r, ...updates } : r)
      };
      localStorage.setItem('app_automations_config', JSON.stringify(next));
      return next;
    });
  };

  const deleteKeywordRule = (id: string) => {
    setAutomationsConfig(prev => {
      const next = {
        ...prev,
        keywordRules: prev.keywordRules.filter(r => r.id !== id)
      };
      localStorage.setItem('app_automations_config', JSON.stringify(next));
      return next;
    });
  };

  const updateSecurityConfig = (updates: Partial<SecurityRBACConfig>) => {
    setSecurityConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_security_config', JSON.stringify(next));
      return next;
    });
  };

  const updateStorageConfig = (updates: Partial<StorageBackupConfig>) => {
    setStorageConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_storage_config', JSON.stringify(next));
      return next;
    });
  };

  const triggerManualBackup = () => {
    const newBackup = {
      id: `bk_${Date.now()}`,
      name: `smartpos_manual_backup_${new Date().toISOString().split('T')[0]}.sql.gz`,
      size: `${(Math.random() * 5 + 12).toFixed(1)} MB`,
      timestamp: new Date().toLocaleString(),
      status: 'completed' as const
    };
    setStorageConfig(prev => {
      const next = {
        ...prev,
        backupHistory: [newBackup, ...prev.backupHistory]
      };
      localStorage.setItem('app_storage_config', JSON.stringify(next));
      return next;
    });
  };

  const updateMarketingConfig = (updates: Partial<MarketingTrackingConfig>) => {
    setMarketingConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_marketing_config', JSON.stringify(next));
      return next;
    });
  };

  const updateHomepageConfig = (updates: Partial<HomepageConfig>) => {
    setHomepageConfig(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_homepage_config', JSON.stringify(next));
      return next;
    });
  };

  const saveToCloud = async () => {
    setIsSaving(true);
    try {
      const payload: Record<string, string> = {
        sidebar_config: JSON.stringify(sections),
        lock_message: lockMessage,
        app_brand_config: JSON.stringify(brandConfig),
        app_ai_config: JSON.stringify(aiConfig),
        app_payment_config: JSON.stringify(paymentConfig),
        app_automations_config: JSON.stringify(automationsConfig),
        app_security_config: JSON.stringify(securityConfig),
        app_storage_config: JSON.stringify(storageConfig),
        app_marketing_config: JSON.stringify(marketingConfig),
        app_homepage_config: JSON.stringify(homepageConfig)
      };

      // 1. Sync to local storage for fast client caching
      Object.entries(payload).forEach(([k, v]) => {
        try { localStorage.setItem(k, v); } catch {}
      });

      // 2. Persist permanently to Cloud SQL PostgreSQL
      await fetch('/api/system/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configs: payload })
      });
    } catch (e) {
      console.error('[Cloud SQL] Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const restoreFromCloudSql = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/system/configs');
      const data = await res.json();
      if (data.success && data.configs && Object.keys(data.configs).length > 0) {
        const c = data.configs;
        if (c.sidebar_config) {
          try {
            const parsed = JSON.parse(c.sidebar_config);
            setSections(parsed);
            localStorage.setItem('sidebar_config', c.sidebar_config);
          } catch {}
        }
        if (c.lock_message) {
          setLockMessage(c.lock_message);
          localStorage.setItem('lock_message', c.lock_message);
        }
        if (c.app_brand_config) {
          try {
            setBrandConfig(JSON.parse(c.app_brand_config));
            localStorage.setItem('app_brand_config', c.app_brand_config);
          } catch {}
        }
        if (c.app_ai_config) {
          try {
            setAiConfig(JSON.parse(c.app_ai_config));
            localStorage.setItem('app_ai_config', c.app_ai_config);
          } catch {}
        }
        if (c.app_payment_config) {
          try {
            setPaymentConfig(JSON.parse(c.app_payment_config));
            localStorage.setItem('app_payment_config', c.app_payment_config);
          } catch {}
        }
        if (c.app_automations_config) {
          try {
            setAutomationsConfig(JSON.parse(c.app_automations_config));
            localStorage.setItem('app_automations_config', c.app_automations_config);
          } catch {}
        }
        if (c.app_security_config) {
          try {
            setSecurityConfig(JSON.parse(c.app_security_config));
            localStorage.setItem('app_security_config', c.app_security_config);
          } catch {}
        }
        if (c.app_storage_config) {
          try {
            setStorageConfig(JSON.parse(c.app_storage_config));
            localStorage.setItem('app_storage_config', c.app_storage_config);
          } catch {}
        }
        if (c.app_marketing_config) {
          try {
            setMarketingConfig(JSON.parse(c.app_marketing_config));
            localStorage.setItem('app_marketing_config', c.app_marketing_config);
          } catch {}
        }
        if (c.app_homepage_config) {
          try {
            setHomepageConfig(JSON.parse(c.app_homepage_config));
            localStorage.setItem('app_homepage_config', c.app_homepage_config);
          } catch {}
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('[Cloud SQL] Restore failed:', e);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const exportAllConfigJSON = () => {
    const fullBackup = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      sections,
      lockMessage,
      brandConfig,
      aiConfig,
      paymentConfig,
      automationsConfig,
      securityConfig,
      storageConfig,
      marketingConfig,
      homepageConfig
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importAllConfigJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.sections) setSections(parsed.sections);
      if (parsed.lockMessage) setLockMessage(parsed.lockMessage);
      if (parsed.brandConfig) setBrandConfig(parsed.brandConfig);
      if (parsed.aiConfig) setAiConfig(parsed.aiConfig);
      if (parsed.paymentConfig) setPaymentConfig(parsed.paymentConfig);
      if (parsed.automationsConfig) setAutomationsConfig(parsed.automationsConfig);
      if (parsed.securityConfig) setSecurityConfig(parsed.securityConfig);
      if (parsed.storageConfig) setStorageConfig(parsed.storageConfig);
      if (parsed.marketingConfig) setMarketingConfig(parsed.marketingConfig);
      if (parsed.homepageConfig) setHomepageConfig(parsed.homepageConfig);

      // Save directly to localStorage
      localStorage.setItem('sidebar_config', JSON.stringify(parsed.sections || sections));
      localStorage.setItem('lock_message', parsed.lockMessage || lockMessage);
      if (parsed.brandConfig) localStorage.setItem('app_brand_config', JSON.stringify(parsed.brandConfig));
      if (parsed.aiConfig) localStorage.setItem('app_ai_config', JSON.stringify(parsed.aiConfig));
      if (parsed.paymentConfig) localStorage.setItem('app_payment_config', JSON.stringify(parsed.paymentConfig));
      if (parsed.automationsConfig) localStorage.setItem('app_automations_config', JSON.stringify(parsed.automationsConfig));
      if (parsed.securityConfig) localStorage.setItem('app_security_config', JSON.stringify(parsed.securityConfig));
      if (parsed.storageConfig) localStorage.setItem('app_storage_config', JSON.stringify(parsed.storageConfig));
      if (parsed.marketingConfig) localStorage.setItem('app_marketing_config', JSON.stringify(parsed.marketingConfig));
      if (parsed.homepageConfig) localStorage.setItem('app_homepage_config', JSON.stringify(parsed.homepageConfig));
      return true;
    } catch (e) {
      console.error("Invalid JSON import", e);
      return false;
    }
  };

  const resetToDefaults = () => {
    setSections(defaultSections);
    setLockMessage('দুঃখিত, এই সেকশনটি বর্তমানে অ্যাডমিন কর্তৃক লক করা রয়েছে!');
    setBrandConfig(defaultBrandConfig);
    setAiConfig(defaultAIConfig);
    setPaymentConfig(defaultPaymentConfig);
    setAutomationsConfig(defaultAutomationsConfig);
    setSecurityConfig(defaultSecurityConfig);
    setStorageConfig(defaultStorageConfig);
    setMarketingConfig(defaultMarketingConfig);
    setHomepageConfig(defaultHomepageConfig);

    localStorage.clear();
  };

  return (
    <SidebarContext.Provider value={{
      sections, setSections, lockMessage, setLockMessage,
      updateSection, renameSectionId, moveSection, deleteSection, duplicateSection, toggleLock, addSection,
      addChildPage, deleteChildPage, updateChildPage, renameChildPageId, moveChildPage, toggleChildLock,
      brandConfig, updateBrandConfig,
      aiConfig, updateAiConfig,
      paymentConfig, updatePaymentConfig,
      automationsConfig, updateAutomationsConfig, addKeywordRule, updateKeywordRule, deleteKeywordRule,
      securityConfig, updateSecurityConfig,
      storageConfig, updateStorageConfig, triggerManualBackup,
      marketingConfig, updateMarketingConfig,
      homepageConfig, updateHomepageConfig,
      saveToCloud, isSaving, exportAllConfigJSON, importAllConfigJSON, resetToDefaults, restoreFromCloudSql
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};
