import React, { useState } from 'react';
import { 
  ChevronDown, 
  Lock, 
  LogOut, 
  Shield, 
  User, 
  ArrowRightLeft, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'motion/react';
import { useSidebar, AnimationStyle } from '../context/SidebarContext';
import { clearActiveSession } from '../utils/session';
import * as Icons from 'lucide-react';

const getAnimationVariants = (style?: AnimationStyle): Variants => {
  switch (style) {
    case 'fade':
      return { hidden: { opacity: 0 }, show: { opacity: 1 } };
    case 'slide-down':
      return { hidden: { opacity: 0, y: -15 }, show: { opacity: 1, y: 0 } };
    case 'zoom':
      return { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } };
    case 'bounce':
      return { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0, transition: { type: 'spring', bounce: 0.6 } } };
    case 'none':
      return { hidden: { opacity: 1, x: 0, y: 0 }, show: { opacity: 1, x: 0, y: 0 } };
    case 'slide-right':
    default:
      return { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } };
  }
};

interface AdminSidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  portalType: 'admin' | 'user';
}

export default function AdminSidebar({ activePage, setActivePage, portalType }: AdminSidebarProps) {
  const { sections, brandConfig } = useSidebar();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    admin_dashboard_section: true,
    marketing_content_section: true
  });

  // Auto-expand section containing the currently active page
  React.useEffect(() => {
    if (activePage) {
      const parent = sections.find(s => s.children.some(c => c.id === activePage));
      if (parent) {
        setExpandedSections(prev => ({ ...prev, [parent.id]: true }));
      }
    }
  }, [activePage, sections]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : false
    }));
  };

  // Assuming for now that 'user' portal means a regular 'user' role.
  // In a real app, this would be determined by the actual logged-in user's roles.
  const currentUserRoles = portalType === 'admin' ? ['admin'] : ['user'];

  const canViewItem = (itemRoles: string[]) => {
    if (!itemRoles || itemRoles.length === 0) return true; // Public by default if no roles specified
    return itemRoles.some(role => currentUserRoles.includes(role));
  };

  // Filter sections and pages based on permissions
  const visibleSections = sections.filter(section => canViewItem(section.roles)).map(section => ({
    ...section,
    children: (section.children || []).filter(child => canViewItem(child.roles || section.roles))
  }));

  const HomeIconComponent = (Icons as any)[brandConfig?.homePageIcon || 'LayoutDashboard'] || Icons.LayoutDashboard;

  return (
    <div className="w-72 h-screen bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 font-sans shadow-sm z-20">
      {/* Sidebar Top Header */}
      <div className="p-5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          {brandConfig?.logoUrl ? (
            <img 
              src={brandConfig.logoUrl} 
              alt={brandConfig.siteNameEn} 
              className="w-8 h-8 rounded-xl object-contain shadow-sm border border-slate-100" 
            />
          ) : (
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: brandConfig?.primaryColor || '#4F46E5' }}
            >
              <HomeIconComponent className="w-4 h-4" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-lg text-slate-900 tracking-tight leading-tight truncate">
              {brandConfig?.siteNameEn || 'SmartPortal'}
            </h1>
            <p className="text-[10px] font-semibold text-slate-500 truncate">
              {brandConfig?.siteNameBn || 'স্মার্ট পোর্টাল'}
            </p>
          </div>
          {brandConfig?.homePageBadge && (
            <span 
              className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-white shadow-xs"
              style={{ backgroundColor: brandConfig?.accentColor || '#10B981' }}
            >
              {brandConfig.homePageBadge}
            </span>
          )}
        </div>
        
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              const nextPortal = portalType === 'admin' ? 'user' : 'admin';
              const defaultUserPage = sections.find(s => s.roles.includes('user') || s.roles.length === 0)?.children.find(c => c.roles?.includes('user') || !c.roles || c.roles.length === 0)?.id || '';
              const defaultPage = nextPortal === 'admin' ? 'controller' : defaultUserPage;
              window.location.href = `/${nextPortal}/${defaultPage}`;
            }}
            className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hover:text-indigo-600 transition-colors text-left truncate cursor-pointer"
          >
            {portalType === 'admin' ? 'Switch to User Portal' : 'Switch to Admin Hub'}
          </button>
        </div>
      </div>
      
      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {visibleSections.map((section) => {
          const isExpanded = expandedSections[section.id] !== undefined ? expandedSections[section.id] : true;
          const isActiveInside = section.children?.some(child => child.id === activePage) || false;
          const ParentIcon = (Icons as any)[section.iconName] || Icons.LayoutDashboard;

          const getSectionWrapperClasses = () => {
            if (!isActiveInside) return 'bg-transparent';
            switch (section.activeStyle) {
              case 'solid': return 'bg-slate-100 rounded-2xl shadow-inner';
              case 'dark': return 'bg-slate-900 rounded-2xl shadow-xl ring-1 ring-slate-800';
              case 'glass': return 'bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm';
              case 'outline': return 'border-2 border-indigo-100 bg-indigo-50/30 rounded-2xl';
              case 'soft':
              default: return 'bg-indigo-50/50 rounded-2xl';
            }
          };

          const fontClass = section.enFont || 'font-sans';
          const headerTextColor = isActiveInside && section.activeStyle === 'dark' ? 'text-white' : (isActiveInside ? 'text-indigo-700' : 'text-slate-700');
          const headerHoverColor = isActiveInside && section.activeStyle === 'dark' ? 'text-slate-200' : 'text-slate-900';
          const iconBgClass = isActiveInside && section.activeStyle === 'dark' ? 'bg-slate-800 border-slate-700 text-indigo-400' : (isActiveInside ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-200 text-slate-500');

          return (
            <div key={section.id} className={`flex flex-col transition-all duration-300 p-1.5 ${getSectionWrapperClasses()} ${fontClass}`}>
              {/* Parent Header */}
              <button 
                onClick={() => toggleSection(section.id)}
                className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer group ${isActiveInside && section.activeStyle === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-sm transition-colors ${iconBgClass} ${!isActiveInside ? 'group-hover:text-slate-700 group-hover:border-slate-300' : ''}`}>
                    <ParentIcon className="w-5 h-5 stroke-[1.5]" />
                  </div>
                  <span className={`font-bold text-sm transition-colors ${headerTextColor} group-hover:${headerHoverColor}`}>
                    {section.enLabel}
                  </span>
                  
                  {section.isLocked && (
                    <Lock className="w-3.5 h-3.5 text-amber-500 ml-1" />
                  )}
                  {/* Pulsing Dot Indicator (when collapsed but active inside) */}
                  {!isExpanded && isActiveInside && (
                    <span className="relative flex h-2.5 w-2.5 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                    </span>
                  )}
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className={`w-4 h-4 transition-colors ${isActiveInside && section.activeStyle === 'dark' ? 'text-indigo-400' : (isActiveInside ? 'text-indigo-600' : 'text-slate-400')}`} />
                </motion.div>
              </button>
              
              {/* Children List (Animated) */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="flex relative mt-2 mb-1">
                      {/* Vertical Line */}
                      <div className={`ml-[25px] w-[2px] shrink-0 absolute top-2 bottom-2 rounded-full ${isActiveInside && section.activeStyle === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`} />
                      
                      <motion.div 
                        className="flex-1 ml-10 space-y-1.5 py-1 pr-2"
                        initial="hidden"
                        animate="show"
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: { staggerChildren: 0.04 }
                          }
                        }}
                      >
                        {section.children && section.children.length > 0 ? (
                          section.children.map((item) => {
                            const isActive = activePage === item.id;
                            const ChildIcon = (Icons as any)[item.iconName] || Icons.File;
                            const childFontClass = item.enFont || 'inherit';
                            
                            return (
                              <motion.button
                                key={item.id}
                                onClick={() => setActivePage(item.id)}
                                variants={getAnimationVariants(item.animationStyle || section.animationStyle)}
                                whileHover={{ scale: 1.02, originX: 0 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm relative text-left group ${childFontClass}`}
                              >
                                {/* Active Background Glide Animation */}
                                {isActive && (
                                  <motion.div
                                    layoutId="active-nav-background"
                                    className="absolute inset-0 rounded-lg overflow-hidden shadow-[0_4px_15px_-3px_rgba(0,0,0,0.3)]"
                                    initial={false}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                  >
                                    <motion.div
                                      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                      transition={{ duration: 6, ease: "linear", repeat: Infinity }}
                                      className="absolute inset-0"
                                      style={{
                                        background: "linear-gradient(90deg, #0f172a, #1e1b4b, #0f172a)",
                                        backgroundSize: "200% 100%"
                                      }}
                                    />
                                    <div className="absolute inset-0 border border-white/10 rounded-lg" />
                                  </motion.div>
                                )}
                                
                                <div className="relative z-10 flex items-center gap-3 w-full">
                                  <ChildIcon className={`w-4 h-4 shrink-0 transition-colors ${
                                    isActive ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : (isActiveInside && section.activeStyle === 'dark' ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-slate-600')
                                  }`} />
                                  <span className={`font-semibold transition-colors ${
                                    isActive ? 'text-white tracking-wide drop-shadow-sm' : (isActiveInside && section.activeStyle === 'dark' ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-500 group-hover:text-slate-700')
                                  }`}>
                                    {item.enLabel}
                                  </span>
                                  
                                  {isActive && (
                                    <motion.div
                                       layoutId="active-nav-indicator"
                                      className={`absolute -left-[35px] w-[8px] h-[8px] rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] ring-4 ${isActiveInside && section.activeStyle === 'dark' ? 'ring-slate-900' : (isActiveInside && section.activeStyle === 'solid' ? 'ring-slate-100' : 'ring-slate-50')}`}
                                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    >
                                      <span className="absolute inset-0 rounded-full bg-indigo-400 animate-ping opacity-75"></span>
                                    </motion.div>
                                  )}
                                </div>
                              </motion.button>
                            );
                          })
                        ) : (
                          <div className="py-2 px-3 text-[11px] text-slate-400 italic bg-white/40 rounded-lg border border-dashed border-slate-200">
                            কোনো পেজ যোগ করা হয়নি
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer: Logged In Identity, Portal Status & Logout Button */}
      <div className="p-3.5 border-t border-slate-200 bg-white space-y-2.5">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs ${
              portalType === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
            }`}>
              {portalType === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {portalType === 'admin' ? 'System Administrator' : 'Portal User'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.2 text-[9px] font-black uppercase rounded ${
                  portalType === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {portalType === 'admin' ? 'ADMIN PANEL' : 'USER PORTAL'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 truncate">
                  /{portalType}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              clearActiveSession();
              window.location.href = `/?logout=true`;
            }}
            title={`লগ আউট করুন (${portalType === 'admin' ? 'Log out from Admin' : 'Log out from User'})`}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Portal Switcher & Route info */}
        <div className="flex items-center justify-between text-[11px] px-1">
          <a
            href="/"
            className="text-slate-500 hover:text-indigo-600 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>🏠 মূল হোমপেজ</span>
          </a>
          <button
            onClick={() => {
              const nextPortal = portalType === 'admin' ? 'user' : 'admin';
              const defaultUserPage = sections.find(s => s.roles.includes('user') || s.roles.length === 0)?.children.find(c => c.roles?.includes('user') || !c.roles || c.roles.length === 0)?.id || '';
              const defaultPage = nextPortal === 'admin' ? 'controller' : defaultUserPage;
              window.location.href = `/${nextPortal}/${defaultPage}`;
            }}
            className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ArrowRightLeft className="w-3 h-3" />
            {portalType === 'admin' ? 'ইউজার পোর্টাল' : 'অ্যাডমিন পোর্টাল'}
          </button>
        </div>
      </div>
    </div>
  );
}
