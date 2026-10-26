import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import { 
  ShieldAlert, 
  Search, 
  LayoutDashboard, 
  Menu, 
  X, 
  Globe, 
  Bell,
  ChevronRight,
  ChevronDown,
  Fingerprint,
  Lock,
  FileText,
  ShieldCheck,
  BarChart3,
  MapPin,
  Smartphone,
  Apple,
  Play,
  Activity,
  Plus,
  User as UserIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Language, Report, User, UserRole } from './types';
import { TRANSLATIONS } from './constants';
import { apiService } from './services/api';
import { socketService } from './services/socket';
import ReportingForm from './components/portal/ReportingForm';
import CaseTracking from './components/portal/CaseTracking';
import AdminDashboard from './components/dashboard/AdminDashboard';
import Login from './components/portal/Login';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Context ---
export const AppContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
} | null>(null);

const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

const Navbar = () => {
  const { lang, setLang, t } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: t('reportNow'), path: '/report', icon: ShieldAlert },
    { name: t('trackStatus'), path: '/track', icon: Search },
    { name: t('adminDashboard'), path: '/admin', icon: LayoutDashboard },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
      (isScrolled || location.pathname !== '/') ? "py-4 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm" : "py-6 bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className={cn("font-bold text-lg tracking-tighter leading-tight transition-colors", (isScrolled || location.pathname !== '/') ? "text-brand-dark" : "text-white")}>
                  DEIG CRS
                </span>
                <span className={cn("text-[9px] font-bold uppercase tracking-widest opacity-60 transition-colors", (isScrolled || location.pathname !== '/') ? "text-slate-500" : "text-white/80")}>
                  {t('federalDefenseOversight')}
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-5 py-2 text-[11px] font-bold transition-all uppercase tracking-widest rounded-full",
                  location.pathname === item.path 
                    ? "bg-brand text-white shadow-lg shadow-brand/20" 
                    : cn("hover:bg-brand/10", (isScrolled || location.pathname !== '/') ? "text-slate-600" : "text-white/80 hover:text-white")
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className={cn("flex items-center space-x-2 border-l pl-6 ml-4", (isScrolled || location.pathname !== '/') ? "border-gray-200" : "border-white/10")}>
              <Globe className={cn("w-4 h-4", (isScrolled || location.pathname !== '/') ? "text-slate-400" : "text-white/40")} />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Language)}
                className={cn(
                  "text-[10px] font-bold bg-transparent border-none focus:ring-0 cursor-pointer uppercase tracking-widest",
                  (isScrolled || location.pathname !== '/') ? "text-slate-600" : "text-white/70"
                )}
              >
                <option value="en" className="text-black">English</option>
                <option value="am" className="text-black">አማርኛ</option>
                <option value="om" className="text-black">Oromoo</option>
                <option value="ti" className="text-black">ትግርኛ</option>
              </select>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn("p-2 transition-colors", (isScrolled || location.pathname !== '/') ? "text-slate-600" : "text-white/60")}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-2xl p-4"
          >
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 px-4 py-4 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-2xl uppercase tracking-widest transition-colors"
                >
                  <item.icon className="w-5 h-5 text-brand/40" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                {(['en', 'am', 'om', 'ti'] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setIsOpen(false); }}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      lang === l ? "bg-brand text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {l === 'en' ? 'EN' : l === 'am' ? 'AM' : l === 'om' ? 'OM' : 'TI'}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Home = () => {
  const { lang, setLang, t } = useAppContext();
  const [reportCount, setReportCount] = useState<number | null>(null);
  const [activeMobileScreen, setActiveMobileScreen] = useState(0);

  useEffect(() => {
    apiService.getStats()
      .then(data => setReportCount(data.total))
      .catch(() => setReportCount(null));
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-brand-dark selection:bg-brand selection:text-white pb-32">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/40 via-brand-dark/20 to-brand-dark/80 z-10" />
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2670&auto=format&fit=crop" 
            alt="Federal Oversight Matrix" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="px-3 py-1 bg-brand/20 border border-brand/30 rounded-full text-[9px] font-bold text-brand uppercase tracking-[0.2em] flex items-center">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full mr-2 animate-pulse" />
                    {t('mobileReady')}
                  </div>
                </div>
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-[1px] bg-brand/40" />
                  <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand/80">
                    {t('officialOversightPortal')}
                  </span>
                </div>
                <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85] text-white mb-10">
                  {t('heroTitle_1')} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand/60">
                    {t('heroTitle_2')}
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-xl font-medium leading-relaxed">
                  {t('heroSubtitle')}
                </p>
                <div className="flex flex-wrap gap-6">
                  <Link 
                    to="/report" 
                    className="bg-brand text-white px-10 py-6 rounded-2xl font-bold flex items-center justify-center hover:opacity-90 transition-all group shadow-2xl shadow-brand/40"
                  >
                    {t('reportNow')}
                    <ChevronRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link 
                    to="/track" 
                    className="glass-dark text-white px-10 py-6 rounded-2xl font-bold flex items-center justify-center transition-all hover:bg-white/10 group overflow-hidden relative"
                  >
                    <span className="relative z-10">{t('trackStatus')}</span>
                    <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <div className="lg:col-span-4 hidden lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="glass-dark p-8 rounded-[3rem] border border-white/5 relative"
              >
                 <div className="absolute -top-6 -right-6 w-24 h-24 bg-brand rounded-full blur-3xl opacity-20" />
                 <div className="relative z-10 space-y-8">
                   {[
                     { label: t('encryption'), value: 'Level 4 AES', icon: Lock },
                     { label: t('anonymous'), value: 'Stripped Metadata', icon: Fingerprint },
                     { label: t('liveMonitoring'), value: 'Within 48 Hours', icon: BarChart3 }
                   ].map((item, i) => (
                     <div key={i} className="flex items-start space-x-4">
                       <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-brand">
                         <item.icon className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{item.label}</p>
                         <p className="text-sm font-bold text-white leading-none">{item.value}</p>
                       </div>
                     </div>
                   ))}
                 </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Statistics rail */}
        <div className="absolute bottom-0 left-0 right-0 py-10 bg-brand-dark/80 backdrop-blur-md border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {[
                { label: t('intelReports'), value: reportCount !== null ? reportCount.toLocaleString() : '1,248' },
                { label: t('ongoingAudits'), value: '342' },
                { label: t('legislativeImpact'), value: '816' },
                { label: t('citizenTrust'), value: '94%' },
              ].map((stat, i) => (
                <div key={i} className="group cursor-default">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2 group-hover:text-brand transition-colors">{stat.label}</p>
                  <p className="text-3xl font-bold font-display text-white tracking-tighter">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-40 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-24 gap-8">
            <div className="max-w-3xl">
              <div className="w-16 h-1 bg-brand mb-10" />
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-tight">
                {t('architectedTitle').split(' ').slice(0, -2).join(' ')} <span className="text-brand">{t('architectedTitle').split(' ').slice(-2).join(' ')}</span>
              </h2>
              <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10">
                {t('architectedDesc')}
              </p>
              <div className="flex flex-wrap gap-4">
                {['protocol_v2.4', 'iso_27001_aligned', 'e2e_encrypted'].map((badge) => (
                  <div key={badge} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <div className="w-1.5 h-1.5 bg-brand rounded-full mr-2 animate-pulse" />
                    {badge}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 shadow-2xl p-8 rounded-[2.5rem] flex items-center space-x-6 border border-white/5 group hover:border-brand/20 transition-all">
              <div className="w-14 h-14 bg-brand/10 rounded-2xl flex items-center justify-center text-brand ring-1 ring-brand/20 group-hover:scale-110 transition-transform">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1">{t('cyberProtocol')}</p>
                <p className="text-sm font-mono font-bold tracking-tighter text-white">{t('isoSecured')}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Fingerprint, 
                title: t('feature1Title'), 
                desc: t('feature1Desc') 
              },
              { 
                icon: ShieldAlert, 
                title: t('feature2Title'), 
                desc: t('feature2Desc') 
              },
              { 
                icon: Bell, 
                title: t('feature3Title'), 
                desc: t('feature3Desc') 
              },
            ].map((feature, i) => (
              <div key={feature.title} className="group p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-10 group-hover:bg-brand group-hover:text-white transition-all duration-500 shadow-inner">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center text-xs font-bold uppercase tracking-widest text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('learnProtocol')} <ChevronRight className="ml-2 w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-40 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-[1px] bg-brand" />
                <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand">
                  {t('mobileApp')}
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-10 leading-tight">
                {t('mobileSectionTitle')}
              </h2>
              <p className="text-xl text-slate-400 font-medium leading-relaxed mb-12 max-w-xl">
                {t('mobileSectionSubtitle')}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
                {[
                  { icon: Fingerprint, title: t('mobileBiometricTitle'), desc: t('mobileBiometricDesc') },
                  { icon: ShieldCheck, title: t('mobileSyncTitle'), desc: t('mobileSyncDesc') }
                ].map((item, i) => (
                  <div key={i} className="group">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-brand mb-6 group-hover:scale-110 transition-transform">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight">{item.title}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center hover:bg-brand hover:text-white transition-all group">
                  <Apple className="w-5 h-5 mr-3 fill-current" />
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-widest opacity-60 leading-none mb-1">Download on</p>
                    <p className="text-sm leading-none">{t('appStore')}</p>
                  </div>
                </button>
                <button className="px-8 py-4 bg-slate-800 text-white rounded-2xl font-bold flex items-center hover:bg-brand transition-all group border border-white/5">
                  <Play className="w-5 h-5 mr-3 fill-current" />
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-widest opacity-60 leading-none mb-1">Get it on</p>
                    <p className="text-sm leading-none">{t('playStore')}</p>
                  </div>
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative"
            >
              {[0, 1, 2].map((screenIdx) => (
                <div key={screenIdx} className={cn(
                  "relative mx-auto w-[320px] aspect-[9/19] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden transition-all duration-700 absolute inset-0",
                  activeMobileScreen === screenIdx ? "z-10 opacity-100 scale-100" : "z-0 opacity-0 scale-95"
                )}>
                  {/* Status Bar */}
                  <div className="absolute top-0 left-0 w-full h-7 px-8 flex justify-between items-center z-20">
                    <span className="text-[10px] font-bold text-white">9:41</span>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-3.5 h-2.5 border border-white/30 rounded-[2px] relative">
                        <div className="absolute top-[2px] left-[1px] bottom-[2px] right-[4px] bg-white rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-0 left-0 w-full h-full bg-[#0F172A] flex flex-col pt-10">
                    {screenIdx === 0 && (
                      <div className="flex-1 overflow-y-auto px-6 hide-scrollbar pb-20">
                        <div className="flex justify-between items-center mb-8">
                          <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Authenticated</p>
                            <h3 className="text-lg font-bold text-white tracking-tight">Agent_Alpha</h3>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-white/5">
                              {(['en', 'am'] as Language[]).map((l) => (
                                <button
                                  key={l}
                                  onClick={() => setLang(l)}
                                  className={cn(
                                    "px-2 py-1 rounded-md text-[8px] font-bold transition-all uppercase tracking-widest",
                                    lang === l ? "bg-brand text-white" : "text-slate-500"
                                  )}
                                >
                                  {l}
                                </button>
                              ))}
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center">
                              <UserIcon className="w-5 h-5 text-slate-400" />
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                           <div className="bg-brand/10 border border-brand/20 rounded-2xl p-4">
                             <ShieldCheck className="w-5 h-5 text-brand mb-3" />
                             <p className="text-[9px] font-bold text-brand uppercase tracking-wider mb-1">Secure</p>
                             <p className="text-xl font-bold text-white tracking-tight">100%</p>
                           </div>
                           <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4">
                             <Activity className="w-5 h-5 text-slate-400 mb-3" />
                             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Activity</p>
                             <p className="text-xl font-bold text-white tracking-tight">High</p>
                           </div>
                        </div>

                        {/* Live Tracker View */}
                        <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-5 mb-8">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Global Matrix</h4>
                            <div className="flex items-center space-x-1">
                              <div className="w-1 h-1 bg-brand rounded-full animate-pulse" />
                              <span className="text-[8px] font-bold text-brand uppercase tracking-wider">{t('liveFeed')}</span>
                            </div>
                          </div>
                          <div className="h-24 relative overflow-hidden rounded-xl bg-slate-900 border border-white/5">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                              <motion.path
                                d="M0 60 Q 40 40, 80 70 T 160 50 T 240 80 T 320 40"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                fill="none"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                            </svg>
                          </div>
                        </div>

                        {/* Recent Reports */}
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Priority_Ledger</h4>
                        <div className="space-y-3">
                           {[
                             { id: 'CX-402', color: 'bg-brand' },
                             { id: 'AX-119', color: 'bg-green-500' },
                             { id: 'RX-990', color: 'bg-amber-500' }
                           ].map((item, i) => (
                             <div key={i} className="bg-white/5 rounded-2xl border border-white/5 p-4 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
                               <div className="flex items-center space-x-3">
                                 <div className={cn("w-2 h-2 rounded-full", item.color)} />
                                 <span className="text-xs font-bold text-white font-mono tracking-tighter">{item.id}</span>
                               </div>
                               <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-white transition-colors" />
                             </div>
                           ))}
                        </div>
                      </div>
                    )}

                    {screenIdx === 1 && (
                      <div className="flex-1 overflow-y-auto px-6 hide-scrollbar pb-20 pt-4">
                        <h4 className="text-xl font-bold text-white mb-6 mt-4">New Report</h4>
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Category</label>
                            <div className="bg-slate-800 border border-white/5 rounded-xl p-4 text-xs text-slate-400">Bribery</div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Industry</label>
                            <div className="bg-slate-800 border border-white/5 rounded-xl p-4 text-xs text-slate-400">Finance Sector</div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Details</label>
                            <div className="bg-slate-800 border border-white/5 rounded-xl p-4 text-[10px] text-slate-500 min-h-[100px]">
                              Evidence encrypted...
                            </div>
                          </div>
                          <button className="w-full bg-brand text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest mt-4">
                            Submit Securely
                          </button>
                        </div>
                      </div>
                    )}

                    {screenIdx === 2 && (
                      <div className="flex-1 overflow-y-auto px-6 hide-scrollbar pb-20 pt-4">
                        <h4 className="text-xl font-bold text-white mb-6 mt-4">Case Tracker</h4>
                        <div className="bg-brand/10 border border-brand/20 rounded-2xl p-5 mb-6">
                          <p className="text-[9px] font-bold text-brand uppercase tracking-wider mb-1">Active Case</p>
                          <p className="text-sm font-mono font-bold text-white uppercase">DEIG-CRS-9901</p>
                        </div>
                        <div className="space-y-6 relative">
                          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-800" />
                          {[
                            { name: 'Submitted', status: 'done' },
                            { name: 'Verification', status: 'current' },
                            { name: 'Investigation', status: 'pending' }
                          ].map((step, i) => (
                            <div key={i} className="flex items-center space-x-4 relative z-10">
                              <div className={cn(
                                "w-4 h-4 rounded-full border-4",
                                step.status === 'done' ? "bg-brand border-brand/20" : 
                                step.status === 'current' ? "bg-accent border-accent/20 animate-pulse" : "bg-slate-900 border-slate-800"
                              )} />
                              <span className={cn(
                                "text-xs font-bold uppercase tracking-widest",
                                step.status === 'pending' ? "text-slate-600" : "text-white"
                              )}>{step.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Navigation Bar */}
                    <div className="h-20 bg-slate-900/80 backdrop-blur-xl border-t border-white/5 px-8 flex justify-between items-center absolute bottom-0 left-0 w-full">
                      <motion.div 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => setActiveMobileScreen(0)}
                        className={activeMobileScreen === 0 ? "text-brand" : "text-slate-600"}
                      >
                        <ShieldAlert className="w-5 h-5 cursor-pointer" />
                      </motion.div>
                      <motion.div 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => setActiveMobileScreen(2)}
                        className={activeMobileScreen === 2 ? "text-brand" : "text-slate-600"}
                      >
                        <BarChart3 className="w-5 h-5 cursor-pointer" />
                      </motion.div>
                      <motion.div 
                        whileTap={{ scale: 0.9 }} 
                        onClick={() => setActiveMobileScreen(1)}
                        className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/40 -mt-8 border-4 border-slate-900 cursor-pointer"
                      >
                        <Plus className="w-6 h-6" />
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.9 }} className="text-slate-600"><MapPin className="w-5 h-5" /></motion.div>
                      <motion.div whileTap={{ scale: 0.9 }} className="text-slate-600"><FileText className="w-5 h-5" /></motion.div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="h-[600px]"></div> {/* Spacer for absolute phones */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-20 p-6 glass-dark rounded-3xl border border-white/10 shadow-2xl hidden md:block"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Sync Status</p>
                    <p className="text-sm font-bold text-white">Quantum_Link Secured</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ReportPage = () => (
  <div className="pt-28 min-h-screen bg-white pb-20 selection-brand">
    <ReportingForm />
  </div>
);

const TrackPage = () => (
  <div className="pt-28 min-h-screen bg-white pb-20 selection-brand">
    <CaseTracking />
  </div>
);

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="pt-24 min-h-screen bg-white pb-20">
      <AdminDashboard user={user} />
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    socketService.connect();
    return () => socketService.disconnect();
  }, []);

  const t = (key: string) => {
    return TRANSLATIONS[key]?.[lang] || key;
  };

  return (
    <AppContext.Provider value={{ lang, setLang, t }}>
      <BrowserRouter>
        <Toaster position="top-right" richColors expand={true} />
        <div className={cn(
          "min-h-screen bg-white text-black selection:bg-brand selection:text-white transition-all duration-500",
          `lang-${lang}`
        )}>
          <Navbar />
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/track" element={<TrackPage />} />
              <Route path="/admin/*" element={<AdminPage />} />
            </Routes>
          </AnimatePresence>

          <section className="py-24 bg-slate-50 border-y border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #e2e8f0 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-12">{t('authorizedVerificationNodes')}</p>
              <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-30 grayscale contrast-125 select-none">
                 {['FEDERAL_REV', 'MIN_JUSTICE', 'OVERSIGHT_CO', 'ETHICS_COM', 'INTEL_DIV'].map((node) => (
                   <span key={node} className="text-xl md:text-2xl font-bold tracking-tighter text-slate-900 border-b-2 border-slate-900/10 pb-1">{node}</span>
                 ))}
              </div>
            </div>
          </section>
          
          <footer className="bg-brand-dark text-white py-20 border-t border-white/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/10 pb-16 mb-16">
                  <div className="mb-12 md:mb-0">
                    <div className="flex items-center space-x-3 mb-8">
                      <div className="w-12 h-12 bg-white text-brand rounded-xl flex items-center justify-center shadow-lg">
                        <ShieldAlert className="w-8 h-8" />
                      </div>
                      <span className="font-bold text-2xl tracking-tighter">DEIG CRS</span>
                    </div>
                    <p className="text-gray-400 font-medium max-w-sm mb-8 leading-relaxed">
                      {t('footerDesc')}
                    </p>
                    <div className="flex space-x-6">
                      {/* Socials */}
                      <a href="#" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black cursor-pointer transition-colors">
                        <Globe className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-12 sm:gap-24">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-8">{t('portal')}</h4>
                      <ul className="space-y-4 text-sm font-medium">
                        <li><Link to="/report" className="text-gray-400 hover:text-white transition-colors">{t('reportNow')}</Link></li>
                        <li><Link to="/track" className="text-gray-400 hover:text-white transition-colors">{t('trackStatus')}</Link></li>
                        <li><Link to="/admin" className="text-gray-400 hover:text-brand transition-colors flex items-center group">
                          <Lock className="w-3 h-3 mr-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                          {t('staffAccess')}
                        </Link></li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white/30 mb-8">{t('legal')}</h4>
                      <ul className="space-y-4 text-sm font-medium">
                        <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('privacyPolicy')}</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('termsOfUse')}</a></li>
                        <li><a href="#" className="text-gray-400 hover:text-white transition-colors">{t('whistleblowerAct')}</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                  <p>&copy; 2026 DEIG Federal Integrity Network • {t('ethiopiaFullName')}</p>
                  <div className="mt-4 sm:mt-0 flex space-x-8">
                     <p>{t('systemStatusLabel')}: ACTIVE</p>
                     <p>{t('uptimeLabel')}: 99.9%</p>
                  </div>
                </div>
              </div>
          </footer>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
