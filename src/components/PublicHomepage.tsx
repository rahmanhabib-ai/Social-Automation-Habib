import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  User, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  MapPin, 
  Send, 
  LayoutDashboard, 
  Globe, 
  Zap, 
  Check, 
  Eye, 
  EyeOff, 
  Key, 
  UserPlus, 
  LogIn, 
  Menu, 
  X, 
  Star, 
  BarChart3, 
  Clock, 
  HelpCircle, 
  Laptop,
  Layers,
  ChevronRight,
  Sliders,
  Bot,
  Database,
  Server,
  Layout
} from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import { startActiveSession } from '../utils/session';

interface PublicHomepageProps {
  initialAuth?: 'login' | 'register' | null;
}

// Icon helper function for dynamic feature items
const renderDynamicIcon = (name: string, className: string = "w-6 h-6") => {
  switch (name) {
    case 'Shield': return <Shield className={className} />;
    case 'User': return <User className={className} />;
    case 'Lock': return <Lock className={className} />;
    case 'Bot': return <Bot className={className} />;
    case 'Zap': return <Zap className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'Sliders': return <Sliders className={className} />;
    case 'Database': return <Database className={className} />;
    case 'Star': return <Star className={className} />;
    case 'BarChart3': return <BarChart3 className={className} />;
    case 'Server': return <Server className={className} />;
    case 'Layers': return <Layers className={className} />;
    case 'Phone': return <Phone className={className} />;
    case 'Mail': return <Mail className={className} />;
    case 'Layout': return <Layout className={className} />;
    default: return <Sparkles className={className} />;
  }
};

interface TranslationSchema {
  header: {
    brandTitle: string;
    brandSubtitle: string;
    userLoginBtnText: string;
    navLinks: Array<{ id: string; label: string; href: string }>;
  };
  hero: {
    badgeText: string;
    headline: string;
    subtext: string;
    primaryBtnText: string;
    secondaryBtnText: string;
    highlights: string[];
  };
  portals: {
    badgeText: string;
    sectionTitle: string;
    sectionSubtitle: string;
    userPortalBadge: string;
    userPortalTitle: string;
    userPortalDesc: string;
    userPortalFeatures: string[];
    userLoginBtn: string;
    userRegisterBtn: string;
  };
  about: {
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
    engine1Title: string;
    engine1Status: string;
    engine2Title: string;
    engine2Status: string;
    engine3Title: string;
    engine3Status: string;
    cloudNote: string;
  };
  features: {
    badgeText: string;
    headline: string;
    subtitle: string;
    items: Array<{
      id: string;
      icon: string;
      title: string;
      description: string;
    }>;
  };
  contact: {
    badgeText: string;
    headline: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    subjectLabel: string;
    subjectPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendBtn: string;
    successTitle: string;
    successSubtitle: string;
  };
  footer: {
    brandTitle: string;
    brandDesc: string;
    navSectionTitle: string;
    userPortalLink: string;
    aboutLink: string;
    featuresLink: string;
    supportSectionTitle: string;
    contactSupportLink: string;
    sslText: string;
    syncText: string;
    copyrightText: string;
    statusText: string;
  };
  authModal: {
    userBadge: string;
    loginTitle: string;
    registerTitle: string;
    loginSubtext: string;
    registerSubtext: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    passwordLabel: string;
    loginBtn: string;
    registerBtn: string;
    quickDemoTitle: string;
    autoFillBtn: string;
    newUserPrompt: string;
    signUpLink: string;
    alreadyUserPrompt: string;
    signInLink: string;
    testHint: string;
    validationRequired: string;
    nameRequired: string;
    redirecting: string;
  };
}

const TRANSLATIONS: Record<'en' | 'bn', TranslationSchema> = {
  en: {
    header: {
      brandTitle: 'Smart Commerce Enterprise',
      brandSubtitle: 'Unified Operating System',
      userLoginBtnText: 'User Login',
      navLinks: [
        { id: '1', label: 'Home', href: '#home' },
        { id: '2', label: 'Portals', href: '#portals' },
        { id: '3', label: 'About', href: '#about' },
        { id: '4', label: 'Features', href: '#features' },
        { id: '5', label: 'Contact', href: '#contact' },
      ],
    },
    hero: {
      badgeText: '✨ Next-Generation Enterprise Operations Platform',
      headline: 'Manage Your Entire Business & Operations in One Unified Cloud System',
      subtext: 'Smart inventory, Sales & CRM, AI automation, real-time message gateway, and multi-role access control—all built into one scalable platform.',
      primaryBtnText: 'Access User Portal',
      secondaryBtnText: 'Explore Features',
      highlights: [
        '⚡ Instant Cloud Sync & Ultra-Fast',
        '🔒 Enterprise-Grade Security',
        '📱 Fully Mobile & Desktop Ready'
      ],
    },
    portals: {
      badgeText: 'PORTAL ARCHITECTURE',
      sectionTitle: 'Dedicated Workspaces for Your Team',
      sectionSubtitle: 'Select your dedicated workspace designed for daily team productivity and streamlined operations',
      userPortalBadge: 'Active Client & Staff Workspace',
      userPortalTitle: 'User & Client Portal',
      userPortalDesc: 'Manage daily sales transactions, customer inquiries, inventory catalogs, live notifications, and real-time business reports.',
      userPortalFeatures: [
        'Single-click secure authentication with User ID & Password',
        'Direct real-time access to order management & dynamic catalogs',
        'Multi-channel customer communication & smart messaging gateway',
        'Fully responsive workstation for desktop, tablet, and mobile'
      ],
      userLoginBtn: 'Enter User Portal',
      userRegisterBtn: 'Create Account',
    },
    about: {
      badgeText: 'ABOUT OUR PLATFORM',
      headline: 'Complete Cloud Solution Engineered for Modern Enterprise Growth',
      description: 'Our platform is engineered to empower businesses of any scale to effortlessly unify sales, customer support, inventory, and databases under a single high-performance system. Clean, scalable, and ultra-reliable.',
      stat1Number: '100%',
      stat1Label: 'Cloud Automation',
      stat1Sub: 'Zero-config & instant sync',
      stat2Number: '99.9%',
      stat2Label: 'System Availability',
      stat2Sub: 'Enterprise SLA guaranteed',
      systemHealthText: 'All Services Operational • 99.99% Uptime',
      engine1Title: 'Core Engine:',
      engine1Status: 'High-Speed Realtime Sync Active',
      engine2Title: 'User Portal:',
      engine2Status: 'Client & Team Workspaces Online',
      engine3Title: 'Security Gateway:',
      engine3Status: '256-Bit SSL Protected',
      cloudNote: 'Built with a modern micro-modular cloud architecture. Scale effortlessly across multiple branches, stores, and team members with zero configuration.',
    },
    features: {
      badgeText: 'POWERFUL CAPABILITIES',
      headline: 'Core Features & Modern Modules',
      subtitle: 'Designed to ensure optimal speed, intelligence, and precision across every business workflow.',
      items: [
        {
          id: '1',
          icon: 'Sliders',
          title: 'Dynamic Page & Workflow Engine',
          description: 'Customize navigation, modules, and role permissions with zero coding required.'
        },
        {
          id: '2',
          icon: 'Shield',
          title: 'Role-Based Access Control (RBAC)',
          description: 'Dedicated access levels and security rules for managers, sales teams, and customer accounts.'
        },
        {
          id: '3',
          icon: 'Bot',
          title: 'Smart Message Gateway & AI',
          description: 'Automated WhatsApp messaging, order status alerts, and customer query resolutions.'
        },
        {
          id: '4',
          icon: 'Zap',
          title: 'Real-Time Cloud Synchronization',
          description: 'Every operational configuration and inventory update reflects immediately across all terminals.'
        },
        {
          id: '5',
          icon: 'Lock',
          title: 'Cloud Backup & Audit Trails',
          description: 'Automated daily backups, export/import options, and detailed user activity audit logs.'
        },
        {
          id: '6',
          icon: 'Globe',
          title: 'Universal Multi-Device Layout',
          description: 'Flawlessly responsive across smartphones, tablets, POS hardware, and desktop workstations.'
        }
      ]
    },
    contact: {
      badgeText: 'GET IN TOUCH',
      headline: 'Contact Our Support Team',
      subtitle: 'Have any questions, customization inquiries, or require technical support? Reach out to us.',
      nameLabel: 'Your Name *',
      namePlaceholder: 'Enter your full name',
      emailLabel: 'Email Address *',
      emailPlaceholder: 'example@domain.com',
      subjectLabel: 'Subject',
      subjectPlaceholder: 'What is this regarding?',
      messageLabel: 'Message *',
      messagePlaceholder: 'Type your message in detail...',
      sendBtn: 'Send Message',
      successTitle: 'Your message has been sent successfully!',
      successSubtitle: 'Our support team will get back to you shortly.',
    },
    footer: {
      brandTitle: 'Smart Commerce Enterprise OS',
      brandDesc: 'Next-generation enterprise operations, real-time messaging, and cloud management solution.',
      navSectionTitle: 'Navigation',
      userPortalLink: 'User Portal (/user)',
      aboutLink: 'Platform Overview',
      featuresLink: 'Core Features',
      supportSectionTitle: 'Help & Security',
      contactSupportLink: 'Customer Support',
      sslText: '✓ 256-Bit SSL Secured',
      syncText: 'Universal Multi-Device Sync',
      copyrightText: `© ${new Date().getFullYear()} Smart Commerce Enterprise. All rights reserved.`,
      statusText: 'All Systems Online & Operational',
    },
    authModal: {
      userBadge: 'User Portal Gateway',
      loginTitle: 'User Sign In',
      registerTitle: 'Create User Account',
      loginSubtext: 'Enter your credentials to access your user portal workspace.',
      registerSubtext: 'Fill in your details to create a new user portal account.',
      nameLabel: 'Full Name *',
      namePlaceholder: 'Enter your full name',
      emailLabel: 'Email or Username *',
      passwordLabel: 'Password *',
      loginBtn: 'Sign In to Portal',
      registerBtn: 'Create Account',
      quickDemoTitle: 'Quick Demo Test Credentials:',
      autoFillBtn: 'Auto Fill',
      newUserPrompt: 'New user?',
      signUpLink: 'Create Account',
      alreadyUserPrompt: 'Already have an account?',
      signInLink: 'Sign In',
      testHint: '💡 For testing, you can enter any valid credentials to log in directly.',
      validationRequired: 'Email and password are required',
      nameRequired: 'Full name is required',
      redirecting: 'Logging into User Portal...',
    },
  },
  bn: {
    header: {
      brandTitle: 'স্মার্ট কমার্স এন্টারপ্রাইজ',
      brandSubtitle: 'ইউনিফায়েড অপারেটিং সিস্টেম',
      userLoginBtnText: 'ইউজার লগইন',
      navLinks: [
        { id: '1', label: 'হোম', href: '#home' },
        { id: '2', label: 'পোর্টাল', href: '#portals' },
        { id: '3', label: 'পরিচিতি', href: '#about' },
        { id: '4', label: 'ফিচারস', href: '#features' },
        { id: '5', label: 'যোগাযোগ', href: '#contact' },
      ],
    },
    hero: {
      badgeText: '✨ নেক্সট-জেনারেশন এন্টারপ্রাইজ ম্যানেজমেন্ট প্ল্যাটফর্ম',
      headline: 'একটি সেন্ট্রালাইজড সিস্টেমে আপনার পুরো ব্যবসা ও অপারেশন পরিচালনা করুন',
      subtext: 'স্মার্ট ইনভেন্টরি, সেলস ও সিআরএম, এআই অটোমেশন, রিয়েলটাইম মেসেজ গেটওয়ে এবং মাল্টি-রোল কন্ট্রোল সিস্টেম—সবকিছু এক প্ল্যাটফর্মে।',
      primaryBtnText: 'ইউজার হিসেবে প্রবেশ করুন',
      secondaryBtnText: 'ফিচারস জানুন',
      highlights: [
        '⚡ ইনস্ট্যান্ট সিঙ্ক ও আল্ট্রা-ফাস্ট',
        '🔒 এন্টারপ্রাইজ গ্রেড সিকিউরিটি',
        '📱 সম্পূর্ণ মোবাইল ও ডেস্কটপ রেডি'
      ],
    },
    portals: {
      badgeText: 'সেন্ট্রালাইজড আর্কিটেকচার',
      sectionTitle: 'ডেডিকেটেড সিস্টেম পোর্টাল',
      sectionSubtitle: 'আপনার দৈনন্দিন টিম ওয়ার্কফ্লো এবং দ্রুত ব্যবসায়িক অপারেশনের জন্য প্রস্তুতকৃত পোর্টাল',
      userPortalBadge: 'অ্যাক্টিভ ক্লায়েন্ট ও স্টাফ ওয়ার্কস্পেস',
      userPortalTitle: 'ইউজার ও টিম পোর্টাল',
      userPortalDesc: 'দৈনন্দিন বিক্রয়, কাস্টমার সার্ভিস, ইনভেন্টরি লিস্ট ব্রাউজিং, মেসেজিং ও লাইভ রিপোর্ট পর্যবেক্ষণ।',
      userPortalFeatures: [
        'ইউজার আইডি ও পাসওয়ার্ড দিয়ে সুরক্ষিত সিঙ্গেল-ক্লিক লগইন',
        'পণ্য ক্যাটালগ ও অর্ডার ম্যানেজমেন্টে সরাসরি এক্সেস',
        'রিয়েলটাইম কাস্টমার মেসেজিং গেটওয়ে ও নোটিফিকেশন',
        'মোবাইল, ট্যাবলেট ও ডেস্কটপে নিখুঁত রেসপন্সিভ অভিজ্ঞতা'
      ],
      userLoginBtn: 'ইউজার পোর্টালে প্রবেশ করুন',
      userRegisterBtn: 'নতুন অ্যাকাউন্ট তৈরি করুন',
    },
    about: {
      badgeText: 'আমাদের প্রযুক্তি পরিচিতি',
      headline: 'আধুনিক ব্যবসায়িক প্রবৃদ্ধির জন্য সম্পূর্ণ ক্লাউড সমাধান',
      description: 'আমাদের প্ল্যাটফর্মটি এমনভাবে ডিজাইন করা যাতে যে কোনো সাইজের ব্যবসা প্রতিষ্ঠান তাদের সেলস, কাস্টমার সাপোর্ট, ইনভেন্টরি ও ডেটাবেজ এক জায়গা থেকেই নির্ভুলভাবে পরিচালনা করতে পারে। সম্পূর্ণ নিরাপদ ও নির্ভরযোগ্য।',
      stat1Number: '১০০%',
      stat1Label: 'ক্লাউড অটোমেশন',
      stat1Sub: 'জিরো কনফিগ ও নিরবচ্ছিন্ন সিঙ্ক',
      stat2Number: '৯৯.৯%',
      stat2Label: 'সিস্টেম আপটাইম',
      stat2Sub: 'এন্টারপ্রাইজ এসএলএ গ্যারান্টিযুক্ত',
      systemHealthText: 'সকল সার্ভিস সক্রিয় • ৯৯.৯৯% আপটাইম',
      engine1Title: 'কোর ইঞ্জিন:',
      engine1Status: 'হাই-স্পিড রিয়েলটাইম সিঙ্ক সক্রিয়',
      engine2Title: 'ইউজার পোর্টাল:',
      engine2Status: 'টিম ওয়ার্কস্পেস অনলাইন',
      engine3Title: 'সিকিউরিটি গেটওয়ে:',
      engine3Status: '২৫৬-বিট এসএসএল সুরক্ষিত',
      cloudNote: 'সিস্টেমটি সম্পূর্ণ আধুনিক মডুলার ক্লাউড আর্কিটেকচারে তৈরি। একাধিক শাখা ও ডিভাইসে নিরবচ্ছিন্নভাবে পরিচালনা করুন।',
    },
    features: {
      badgeText: 'কোর টেকনোলজি',
      headline: 'পাওয়ারফুল ফিচারস ও আধুনিক সুবিধাসমূহ',
      subtitle: 'যেসব সুবিধা আপনার ব্যবসায় গতি এবং নির্ভুলতা নিশ্চিত করবে।',
      items: [
        {
          id: '1',
          icon: 'Sliders',
          title: 'ডায়নামিক পেজ ও হোম বিল্ডার',
          description: 'কোডিং ছাড়াই সাইডবার ও হোমপেজের প্রতিটি সেকশন, হেডার, মেনু লাইভ এডিট করুন।'
        },
        {
          id: '2',
          icon: 'Shield',
          title: 'রোল-বেসড এক্সেস কন্ট্রোল (RBAC)',
          description: 'ম্যানেজার, সেলস টিম, ডেলিভারি ও সাধারণ ইউজারদের জন্য আলাদা এক্সেস লেভেল ও সিকিউরিটি রুলস।'
        },
        {
          id: '3',
          icon: 'Bot',
          title: 'স্মার্ট মেসেজ গেটওয়ে ও এআই',
          description: 'হোয়াটসঅ্যাপ, এসএমএস ও কাস্টমার কোয়েরি হ্যান্ডেল করার জন্য ইন্টেলিজেন্ট অটোমেশন।'
        },
        {
          id: '4',
          icon: 'Zap',
          title: 'রিয়েল-টাইম লাইভ সিঙ্ক',
          description: 'যেকোনো কনফিগারেশন পরিবর্তন সাথে সাথে সমস্ত ক্লায়েন্ট ডিভাইসে কার্যকর হয়।'
        },
        {
          id: '5',
          icon: 'Lock',
          title: 'ক্লাউড ব্যাকআপ ও অডিট লগ',
          description: 'স্বয়ংক্রিয় ব্যাকআপ, এক্সপোর্ট-ইমপোর্ট এবং অ্যাক্টিভিটি অডিট ট্র্যাকিং সুবিধা।'
        },
        {
          id: '6',
          icon: 'Globe',
          title: 'ইউনিভার্সাল মাল্টি-ডিভাইস',
          description: 'স্মার্টফোন, ট্যাবলেট এবং ডেস্কটপ কম্পিউটারে চমৎকার রেসপন্সিভ এক্সপেরিয়েন্স।'
        }
      ]
    },
    contact: {
      badgeText: 'সাপোর্ট ও যোগাযোগ',
      headline: 'যোগাযোগ ও সহায়তা (Contact Us)',
      subtitle: 'কোনো প্রশ্ন, কাস্টমাইজেশন অনুরোধ বা সাপোর্টের জন্য আমাদের সাথে যোগাযোগ করুন।',
      nameLabel: 'আপনার নাম *',
      namePlaceholder: 'পুরো নাম লিখুন',
      emailLabel: 'ইমেইল ঠিকানা *',
      emailPlaceholder: 'example@email.com',
      subjectLabel: 'বিষয় (Subject)',
      subjectPlaceholder: 'বার্তার বিষয় লিখুন',
      messageLabel: 'বার্তা (Message) *',
      messagePlaceholder: 'আপনার বার্তা বিস্তারিত লিখুন...',
      sendBtn: 'বার্তা পাঠান',
      successTitle: 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে!',
      successSubtitle: 'আমাদের প্রতিনিধি শীঘ্রই আপনার সাথে যোগাযোগ করবেন।',
    },
    footer: {
      brandTitle: 'Smart Commerce Enterprise OS',
      brandDesc: 'নেক্সট-জেনারেশন এন্টারপ্রাইজ অপারেশন, রিয়েলটাইম মেসেজিং ও ম্যানেজমেন্ট সল্যুশন।',
      navSectionTitle: 'পোর্টাল লিঙ্কসমূহ',
      userPortalLink: 'ইউজার পোর্টাল (/user)',
      aboutLink: 'প্ল্যাটফর্ম পরিচিতি',
      featuresLink: 'ফিচারস ও সার্ভিস',
      supportSectionTitle: 'হেল্প ও নিরাপত্তা',
      contactSupportLink: 'কাস্টমার সাপোর্ট',
      sslText: '✓ 256-Bit SSL Secured',
      syncText: 'Universal Multi-Device Sync',
      copyrightText: `© ${new Date().getFullYear()} Smart Commerce Enterprise. সর্বস্বত্ব সংরক্ষিত।`,
      statusText: 'সকল সার্ভিস অনলাইন ও সক্রিয়',
    },
    authModal: {
      userBadge: 'ইউজার পোর্টাল গেটওয়ে',
      loginTitle: 'ইউজার লগইন করুন',
      registerTitle: 'নতুন অ্যাকাউন্ট তৈরি করুন',
      loginSubtext: 'আপনার ইউজার পোর্টালে এক্সেস করতে তথ্য প্রদান করুন।',
      registerSubtext: 'আপনার নতুন ইউজার অ্যাকাউন্ট তৈরি করতে তথ্য দিন।',
      nameLabel: 'সম্পূর্ণ নাম *',
      namePlaceholder: 'আপনার নাম লিখুন',
      emailLabel: 'ইমেইল বা ইউজারনেম *',
      passwordLabel: 'পাসওয়ার্ড *',
      loginBtn: 'পোর্টালে প্রবেশ করুন',
      registerBtn: 'অ্যাকাউন্ট তৈরি করুন',
      quickDemoTitle: 'কুইক ডেমো টেস্ট ক্রেডেনশিয়াল:',
      autoFillBtn: 'অটো ফিল করুন',
      newUserPrompt: 'নতুন ইউজার?',
      signUpLink: 'নতুন একাউন্ট খুলুন',
      alreadyUserPrompt: 'ইতিমধ্যে একাউন্ট আছে?',
      signInLink: 'লগইন করুন',
      testHint: '💡 টেস্ট করতে যেকোনো ইমেইল ও পাসওয়ার্ড প্রদান করে সরাসরি এন্টার করতে পারেন।',
      validationRequired: 'ইমেইল এবং পাসওয়ার্ড আবশ্যক',
      nameRequired: 'আপনার সম্পূর্ণ নাম লিখুন',
      redirecting: 'ইউজার পোর্টালে প্রবেশ করা হচ্ছে...',
    },
  }
};

export default function PublicHomepage({ initialAuth = null }: PublicHomepageProps) {
  const navigate = useNavigate();
  const { sections, homepageConfig, brandConfig } = useSidebar();

  // Language state: defaults to English ('en') as requested!
  const [lang, setLang] = useState<'en' | 'bn'>(() => {
    const saved = localStorage.getItem('public_homepage_lang');
    if (saved === 'bn' || saved === 'en') return saved;
    return 'en';
  });

  const handleLanguageChange = (newLang: 'en' | 'bn') => {
    setLang(newLang);
    localStorage.setItem('public_homepage_lang', newLang);
  };

  const t = TRANSLATIONS[lang];

  // Dynamic values with i18n fallback
  const brandTitle = homepageConfig?.header?.brandTitle && lang === 'bn' 
    ? (brandConfig?.siteNameBn || homepageConfig.header.brandTitle)
    : (homepageConfig?.header?.brandTitle || t.header.brandTitle);

  const brandSubtitle = homepageConfig?.header?.brandSubtitle && lang === 'bn'
    ? (brandConfig?.taglineBn || homepageConfig.header.brandSubtitle)
    : (homepageConfig?.header?.brandSubtitle || t.header.brandSubtitle);

  // Auth modal state - strictly User Portal for public homepage
  const [authModal, setAuthModal] = useState<'login' | 'register' | null>(initialAuth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Handle Login / Registration for User Portal
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email || !password) {
      setAuthError(t.authModal.validationRequired);
      return;
    }

    if (authModal === 'register' && !fullName) {
      setAuthError(t.authModal.nameRequired);
      return;
    }

    setAuthSuccess(t.authModal.redirecting);
    setTimeout(() => {
      // Find default user page or /user
      const defaultUserPage = sections.find(s => s.roles.includes('user') || s.roles.length === 0)?.children.find(c => c.roles?.includes('user') || !c.roles || c.roles.length === 0)?.id || '';
      const targetUrl = defaultUserPage ? `/user/${defaultUserPage}` : '/user';
      startActiveSession(targetUrl);
      navigate(targetUrl);
    }, 600);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;
    setContactSent(true);
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
      setContactSent(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* 1. PUBLIC HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 bg-clip-text text-transparent block leading-tight">
                {brandTitle}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 font-mono">
                {brandSubtitle}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {t.header.navLinks.map(link => (
              <a 
                key={link.id} 
                href={link.href} 
                className="hover:text-indigo-600 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons: Language Switcher & User Login */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* Prominent Language Switcher: English & বাংলা */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Switch language to English"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>English</span>
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('bn')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  lang === 'bn'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="বাংলায় পরিবর্তন করুন"
              >
                <span>বাংলা</span>
              </button>
            </div>

            {/* User Login Button (Admin button has been completely removed) */}
            <button
              onClick={() => {
                setAuthModal('login');
              }}
              className="px-4 py-2.5 rounded-xl border border-emerald-300/80 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>{t.header.userLoginBtnText}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-4 animate-in slide-in-from-top-2 duration-150">
            
            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" />
                Language / ভাষা:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    lang === 'en'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('bn')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    lang === 'bn'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-3 font-semibold text-sm text-slate-700 pt-1">
              {t.header.navLinks.map(link => (
                <a 
                  key={link.id} 
                  href={link.href} 
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 hover:text-indigo-600 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Mobile User Login Button */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModal('login');
                }}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <User className="w-4 h-4" /> {t.header.userLoginBtnText}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="home" className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-gradient-to-b from-white via-indigo-50/25 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold shadow-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{t.hero.badgeText}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {t.hero.headline}
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {t.hero.subtext}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <button
                onClick={() => setAuthModal('login')}
                className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer text-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>{t.hero.primaryBtnText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#portals"
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-indigo-900 font-bold rounded-2xl border border-slate-300/80 hover:border-indigo-400 shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer text-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                <span>{t.hero.secondaryBtnText}</span>
              </a>
            </div>

            {/* Micro Highlights */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
              {t.hero.highlights.map((hl, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {hl}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEDICATED PORTALS OVERVIEW SECTION (Admin card completely removed) */}
      <section id="portals" className="py-16 md:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black tracking-widest text-indigo-600 uppercase font-mono">
              {t.portals.badgeText}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              {t.portals.sectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {t.portals.sectionSubtitle}
            </p>
          </div>

          {/* Single Dedicated User Portal Showcase Card */}
          <div className="max-w-3xl mx-auto">
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border border-emerald-200/90 shadow-lg hover:shadow-xl transition-all space-y-6">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100/90 px-3 py-1 rounded-full inline-block mb-1">
                      {t.portals.userPortalBadge}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900">
                      {t.portals.userPortalTitle}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                  Route: /user
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {t.portals.userPortalDesc}
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {t.portals.userPortalFeatures.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3.5 border-t border-emerald-100">
                <button
                  onClick={() => {
                    setAuthModal('login');
                  }}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.portals.userLoginBtn}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <button
                  onClick={() => {
                    setAuthModal('register');
                  }}
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <UserPlus className="w-4 h-4 text-slate-500" />
                  <span>{t.portals.userRegisterBtn}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 4. ABOUT SECTION */}
      <section id="about" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-black tracking-widest text-indigo-600 uppercase font-mono">
                {t.about.badgeText}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 leading-tight">
                {t.about.headline}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {t.about.description}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-2xl font-black text-indigo-600">{t.about.stat1Number}</span>
                  <p className="text-xs font-bold text-slate-700">{t.about.stat1Label}</p>
                  <p className="text-[11px] text-slate-500">{t.about.stat1Sub}</p>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-2xl font-black text-emerald-600">{t.about.stat2Number}</span>
                  <p className="text-xs font-bold text-slate-700">{t.about.stat2Label}</p>
                  <p className="text-[11px] text-slate-500">{t.about.stat2Sub}</p>
                </div>
              </div>
            </div>

            {/* Visual Architecture Box */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-8 rounded-3xl text-white shadow-xl space-y-6 border border-indigo-500/20">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-mono text-slate-400 pl-2">{t.about.systemHealthText}</span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <span className="text-indigo-300">{t.about.engine1Title}</span>
                  <span className="text-emerald-400 font-bold">{t.about.engine1Status}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <span className="text-indigo-300">{t.about.engine2Title}</span>
                  <span className="text-emerald-400 font-bold">{t.about.engine2Status}</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <span className="text-indigo-300">{t.about.engine3Title}</span>
                  <span className="text-emerald-400 font-bold">{t.about.engine3Status}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {t.about.cloudNote}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FEATURES & SERVICES SECTION */}
      <section id="features" className="py-16 md:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black tracking-widest text-indigo-600 uppercase font-mono">
              {t.features.badgeText}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              {t.features.headline}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {t.features.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.features.items.map((feat) => (
              <div key={feat.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  {renderDynamicIcon(feat.icon)}
                </div>
                <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONTACT SECTION */}
      <section id="contact" className="py-16 md:py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md p-8 sm:p-10 space-y-8">
            
            <div className="text-center space-y-2">
              <span className="text-xs font-black tracking-widest text-indigo-600 uppercase font-mono">
                {t.contact.badgeText}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                {t.contact.headline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {t.contact.subtitle}
              </p>
            </div>

            {contactSent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-emerald-900">{t.contact.successTitle}</h4>
                <p className="text-xs text-emerald-700">{t.contact.successSubtitle}</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.contact.nameLabel}</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={t.contact.namePlaceholder}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.contact.emailLabel}</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder={t.contact.emailPlaceholder}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.contact.subjectLabel}</label>
                  <input
                    type="text"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder={t.contact.subjectPlaceholder}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.contact.messageLabel}</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder={t.contact.messagePlaceholder}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.contact.sendBtn}</span>
                </button>
              </form>
            )}

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-slate-600">
              <div className="flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                <span>support@smartcommerce.app</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>+880 1700-000000</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 text-rose-600" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. PUBLIC FOOTER */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Brand Info */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-lg font-black tracking-tight text-white">
                  {t.footer.brandTitle}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                {t.footer.brandDesc}
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">{t.footer.navSectionTitle}</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><button onClick={() => setAuthModal('login')} className="hover:text-emerald-400 cursor-pointer">{t.footer.userPortalLink}</button></li>
                <li><a href="#about" className="hover:text-white">{t.footer.aboutLink}</a></li>
                <li><a href="#features" className="hover:text-white">{t.footer.featuresLink}</a></li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">{t.footer.supportSectionTitle}</h4>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="#contact" className="hover:text-white">{t.footer.contactSupportLink}</a></li>
                <li><span className="text-emerald-400 font-semibold">{t.footer.sslText}</span></li>
                <li><span className="text-slate-400">{t.footer.syncText}</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>{t.footer.copyrightText}</p>
            <p className="font-mono text-[11px]">{t.footer.statusText}</p>
          </div>
        </div>
      </footer>

      {/* 8. AUTH MODAL (USER PORTAL ONLY FOR PUBLIC HOMEPAGE) */}
      {authModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150">
            
            {/* Close Button */}
            <button
              onClick={() => setAuthModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Portal Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 bg-emerald-100 text-emerald-800">
                <User className="w-3.5 h-3.5" />
                <span>{t.authModal.userBadge}</span>
              </div>
            </div>

            {/* Modal Heading */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {authModal === 'login' ? t.authModal.loginTitle : t.authModal.registerTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              {authModal === 'login' ? t.authModal.loginSubtext : t.authModal.registerSubtext}
            </p>

            {/* Error / Success Notifications */}
            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {authError}
              </div>
            )}
            {authSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                {authSuccess}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authModal === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t.authModal.nameLabel}</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={t.authModal.namePlaceholder}
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.authModal.emailLabel}</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                  <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@smartpos.cloud"
                    className="w-full text-xs outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.authModal.passwordLabel}</label>
                <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                  <Key className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-xs text-white shadow-md bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {authModal === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{t.authModal.loginBtn}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{t.authModal.registerBtn}</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Assistant */}
            <div className="mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
              <span className="font-bold text-slate-800 block">{t.authModal.quickDemoTitle}</span>
              <div className="flex items-center justify-between font-mono bg-white p-2 rounded-lg border border-slate-200">
                <span>user@smartpos.cloud</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('user@smartpos.cloud');
                    setPassword('123456');
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold font-sans cursor-pointer underline"
                >
                  {t.authModal.autoFillBtn}
                </button>
              </div>
            </div>

            {/* Switch between Login and Register */}
            <div className="mt-4 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
              {authModal === 'login' ? (
                <p>
                  {t.authModal.newUserPrompt}{' '}
                  <button
                    onClick={() => { setAuthError(null); setAuthModal('register'); }}
                    className="text-emerald-600 font-bold hover:underline cursor-pointer"
                  >
                    {t.authModal.signUpLink}
                  </button>
                </p>
              ) : (
                <p>
                  {t.authModal.alreadyUserPrompt}{' '}
                  <button
                    onClick={() => { setAuthError(null); setAuthModal('login'); }}
                    className="text-emerald-600 font-bold hover:underline cursor-pointer"
                  >
                    {t.authModal.signInLink}
                  </button>
                </p>
              )}
            </div>

            {/* Quick Demo Hint */}
            <div className="mt-4 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[10.5px] text-slate-500 text-center font-mono">
              {t.authModal.testHint}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
