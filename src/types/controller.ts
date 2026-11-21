export type Role = 'admin' | 'manager' | 'assistant_manager' | 'sales_manager' | 'sales_team' | 'warehouse' | 'delivery_man' | 'user';
export type SectionColor = 'amber' | 'rose' | 'emerald' | 'indigo' | 'blue' | 'slate' | 'purple' | 'cyan' | 'teal' | 'orange' | 'pink' | 'red';
export type AnimationStyle = 'slide-right' | 'slide-down' | 'fade' | 'zoom' | 'bounce' | 'none';
export type ActiveStyle = 'soft' | 'solid' | 'glass' | 'dark' | 'outline';
export type FontFamily = 'font-sans' | 'font-serif' | 'font-mono';

export interface BrandThemeConfig {
  siteNameEn: string;
  siteNameBn: string;
  taglineEn: string;
  taglineBn: string;
  logoUrl: string;
  darkLogoUrl: string;
  faviconUrl: string;
  homePageIcon: string;
  homePageBadge: string;
  h1Font: string;
  bodyFont: string;
  fontScale: 'compact' | 'normal' | 'large';
  fontWeight: '400' | '500' | '600' | '700' | '800';
  primaryColor: string; // Hex color or named
  accentColor?: string;
  surfaceTheme: 'light' | 'dark' | 'slate' | 'warm';
  borderRadius: '0px' | '8px' | '14px' | '9999px';
  buttonShadow: 'none' | 'soft' | 'glow' | 'elevation';
  buttonHoverEffect: 'scale' | 'glow' | 'ripple' | 'slide';
  iconAlignment: 'left' | 'right' | 'icon-only';
  sidebarMode: 'fixed' | 'mini' | 'floating';
  topbarSticky: boolean;
  containerWidth: 'fluid' | 'boxed' | 'compact';
  showBreadcrumb: boolean;
  defaultLanguage: 'bn' | 'en';
  currency: 'BDT' | 'USD';
  timeFormat: '12h' | '24h';
}

export interface AIHubConfig {
  geminiApiKey: string;
  geminiModel: string;
  openaiApiKey: string;
  openaiModel: string;
  openaiImageModel?: string;
  claudeApiKey: string;
  claudeModel: string;
  deepseekApiKey: string;
  deepseekModel: string;
  taskRouting: {
    whatsappBot: 'gemini' | 'openai' | 'claude' | 'deepseek';
    contentWriter: 'gemini' | 'openai' | 'claude' | 'deepseek';
    dataAnalysis: 'gemini' | 'openai' | 'claude' | 'deepseek';
    imageGenerator?: 'dall-e-3' | 'imagen-3' | 'sharp-svg' | 'free-builtin';
  };
  autoFallbackEnabled: boolean;
  systemPrompt: string;
  aiTone: 'friendly' | 'professional' | 'concise' | 'creative';
  dailyTokenLimit: number;
  monthlyBudgetUsd: number;
}

export interface PaymentIntegrationsConfig {
  // bKash
  bkashType: 'personal' | 'merchant';
  bkashNumber: string;
  bkashAppKey: string;
  bkashSecret: string;
  bkashUsername: string;
  bkashPassword: string;
  // Nagad
  nagadType: 'personal' | 'merchant';
  nagadNumber: string;
  nagadMerchantId: string;
  nagadPublicKey: string;
  nagadPrivateKey: string;
  // Rocket
  rocketType: 'personal' | 'merchant';
  rocketNumber: string;
  // SSLCommerz
  sslcommerzStoreId: string;
  sslcommerzStorePassword: string;
  sslcommerzIsSandbox: boolean;
  // EPS Payment
  epsMerchantId: string;
  epsSecretKey: string;
  // Stripe
  stripePublishableKey: string;
  stripeSecretKey: string;
  // PayPal
  paypalClientId: string;
  paypalSecretKey: string;
  // Email SMTP / Resend / Mailgun
  emailProvider: 'smtp' | 'resend' | 'mailgun' | 'sendgrid';
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  resendApiKey: string;
  fromEmail: string;
  fromName: string;
  // Webhooks
  webhookUrl: string;
  webhookSecret: string;
  webhookEvents: string[];
}

export interface KeywordRule {
  id: string;
  keyword: string;
  response: string;
  matchType: 'exact' | 'contains';
  enabled: boolean;
}

export interface AutomationsConfig {
  autoSendInvoiceOnOrder: boolean;
  invoiceTemplate: string;
  autoSendTrackingOnShipped: boolean;
  courierPartner: 'steadfast' | 'pathao' | 'redx' | 'paperfly';
  abandonedCartRecovery: boolean;
  abandonedCartDelayMinutes: number;
  abandonedCartDiscountPercent: number;
  keywordRules: KeywordRule[];
}

export interface RolePermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
}

export interface SecurityRBACConfig {
  rolePermissions: Record<Role, RolePermission>;
  requireWhatsApp2FA: boolean;
  sessionTimeoutMinutes: number;
  ipWhitelist: string;
  countryBlockerEnabled: boolean;
  blockedCountries: string[];
  auditLogs: Array<{
    id: string;
    user: string;
    role: string;
    action: string;
    resource: string;
    timestamp: string;
    ip: string;
  }>;
}

export interface StorageBackupConfig {
  storageProvider: 's3' | 'r2' | 'gcs' | 'firebase' | 'local';
  provider?: 's3' | 'r2' | 'gcs' | 'firebase' | 'local';
  s3Bucket: string;
  bucketName?: string;
  s3Region: string;
  region?: string;
  s3AccessKey: string;
  accessKeyId?: string;
  s3SecretKey: string;
  secretAccessKey?: string;
  customCdnDomain: string;
  autoBackupEnabled: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  backupNotificationEmail: string;
  retentionDays?: number;
  backupHistory: Array<{
    id: string;
    name: string;
    size: string;
    timestamp: string;
    status: 'completed' | 'failed';
  }>;
}

export interface MarketingTrackingConfig {
  // Google SEO & Ranking Master Suite
  seoTitleEn: string;
  seoTitleBn: string;
  seoMetaDescriptionEn: string;
  seoMetaDescriptionBn: string;
  seoTargetKeywordsEn: string;
  seoTargetKeywordsBn: string;
  seoCanonicalUrl: string;
  seoRobotsDirective: 'index, follow' | 'noindex, follow' | 'index, nofollow' | 'noindex, nofollow';
  seoAuthorOrPublisher: string;
  googleSiteVerificationTag: string;
  bingSiteVerificationTag: string;
  sitemapXmlUrl: string;
  googleSearchConsoleUrl: string;
  enableStructuredSchema: boolean;
  schemaBusinessType: 'Organization' | 'Store' | 'Pharmacy' | 'Restaurant' | 'LocalBusiness' | 'SoftwareApplication';

  // Pixels & Analytics
  metaPixelId: string;
  metaCapiToken: string;
  metaTestEventCode: string;
  gtmContainerId: string;
  ga4MeasurementId: string;
  tiktokPixelId: string;
  clarityProjectId: string;
  pinterestTagId?: string;

  // Custom Injections
  headerCode: string;
  bodyCode: string;
  footerCode: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
  isVisible: boolean;
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

export interface HomepageConfig {
  header: {
    brandTitle: string;
    brandSubtitle: string;
    showLogoIcon: boolean;
    navLinks: NavItem[];
    showUserLoginBtn: boolean;
    userLoginBtnText: string;
    showAdminLoginBtn: boolean;
    adminLoginBtnText: string;
  };
  hero: {
    showHero: boolean;
    badgeText: string;
    headline: string;
    subtext: string;
    primaryBtnText: string;
    primaryBtnAction: 'user_login' | 'admin_login' | 'url';
    primaryBtnUrl?: string;
    secondaryBtnText: string;
    secondaryBtnAction: 'user_login' | 'admin_login' | 'url';
    secondaryBtnUrl?: string;
    highlights: string[];
  };
  portals: {
    showPortals: boolean;
    badgeText: string;
    sectionTitle: string;
    sectionSubtitle: string;
    showUserPortalCard: boolean;
    userPortalTitle: string;
    userPortalDesc: string;
    userPortalFeatures: string[];
    showAdminPortalCard: boolean;
    adminPortalTitle: string;
    adminPortalDesc: string;
    adminPortalFeatures: string[];
  };
  about: {
    showAbout: boolean;
    badgeText: string;
    headline: string;
    description: string;
    stat1Number: string;
    stat1Label: string;
    stat1Sub: string;
    stat2Number: string;
    stat2Label: string;
    stat2Sub: string;
    systemHealthText: string;
  };
  features: {
    showFeatures: boolean;
    badgeText: string;
    headline: string;
    subtitle: string;
    items: FeatureItem[];
  };
  contact: {
    showContact: boolean;
    badgeText: string;
    headline: string;
    subtitle: string;
    email: string;
    phone: string;
    address: string;
    showForm: boolean;
  };
  footer: {
    brandTitle: string;
    brandDesc: string;
    copyrightText: string;
    statusText: string;
  };
}
