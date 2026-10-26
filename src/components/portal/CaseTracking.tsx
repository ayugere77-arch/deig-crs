import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  FileText,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  Building,
  MapPin
} from 'lucide-react';
import { Report } from '../../types';
import { AppContext } from '../../App';
import { apiService } from '../../services/api';

export default function CaseTracking() {
  const { t } = useContext(AppContext)!;
  const [trackingId, setTrackingId] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getReportByTrackingId(trackingId);
      setReport(data);
    } catch (err: any) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { name: t('status1Name'), desc: t('status1Desc') },
    { name: t('status2Name'), desc: t('status2Desc') },
    { name: t('status3Name'), desc: t('status3Desc') },
    { name: t('status4Name'), desc: t('status4Desc') },
    { name: t('status5Name'), desc: t('status5Desc') },
  ];

  const currentStep = report ? statusSteps.findIndex(s => s.name === report.status) : -1;

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-20 text-slate-900">
      <div className="text-center mb-16">
        <div className="flex justify-center items-center space-x-3 mb-6">
          <div className="w-12 h-[1px] bg-brand/30" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand">{t('secureVerificationPortal')}</span>
          <div className="w-12 h-[1px] bg-brand/30" />
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6 leading-tight">{t('caseTrackingTitle').split(' ')[0]} <span className="text-brand">{t('caseTrackingTitle').split(' ')[1]}</span></h1>
        <p className="text-lg text-slate-500 max-w-lg mx-auto font-medium leading-relaxed">
          {t('caseTrackingSubtitle')}
        </p>
      </div>

      <div className="bg-brand-muted rounded-[3.5rem] p-10 md:p-14 shadow-2xl shadow-brand/10 border border-brand/20 mb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-brand" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6 relative z-10">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand transition-colors" />
            <input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="HASH_REF: DEIG-CRS-2026-XXXXXX"
              className="w-full bg-white border-brand/20 border-2 focus:border-brand focus:ring-8 focus:ring-brand/10 rounded-2xl py-6 pl-14 pr-6 font-mono text-sm font-bold tracking-tight transition-all placeholder:text-slate-300"
            />
          </div>
          <button
            disabled={loading}
            className="bg-slate-900 text-white px-12 py-6 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-brand transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-slate-900/10 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>{t('verifyIdentity')}</span><ChevronDown className="w-4 h-4 ml-1 opacity-40" /></>}
          </button>
        </form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center space-x-3 text-sm font-medium border border-red-100"
          >
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}
      </div>

      {report && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Status Timeline */}
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-slate-200 border border-gray-100 relative overflow-hidden">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
                <Clock className="w-6 h-6 mr-4 text-brand opacity-40" /> {t('investigationPhase')}
              </h2>
              <div className="px-4 py-1.5 bg-slate-50 rounded-full border border-gray-100">
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Case_Ref: {report.id}</span>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute left-[27px] top-4 bottom-4 w-[2px] bg-slate-100" />
              <div className="space-y-14 relative">
                {statusSteps.map((step, idx) => {
                  const isActive = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  
                  return (
                    <div key={step.name} className="flex group">
                      <div className={`
                        w-14 h-14 rounded-2xl relative z-10 flex items-center justify-center transition-all duration-700
                        ${isActive ? 'bg-brand text-white shadow-2xl shadow-brand/40 scale-110 ring-8 ring-brand/5' : 'bg-white border border-slate-100 text-slate-200'}
                      `}>
                        {isActive ? <CheckCircle2 className="w-7 h-7 text-accent" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                      </div>
                      <div className="ml-8 pt-1">
                        <div className="flex items-center space-x-4 mb-1">
                          <h3 className={`text-lg font-bold transition-colors duration-500 ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>
                            {step.name}
                          </h3>
                          {isCurrent && (
                            <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">{t('inLogicPath')}</span>
                            </div>
                          )}
                        </div>
                        <p className={`text-sm leading-relaxed font-medium transition-colors duration-500 ${isActive ? 'text-slate-500' : 'text-slate-200'}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-brand-dark rounded-[3rem] p-12 relative overflow-hidden group shadow-2xl shadow-slate-900/10">
               <ShieldCheck className="absolute top-0 right-0 p-12 w-64 h-64 text-white opacity-[0.03] rotate-12 transition-transform duration-1000 group-hover:rotate-45" />
               <div className="relative z-10">
                 <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-10 flex items-center">
                   <div className="w-6 h-[1px] bg-brand mr-3" /> {t('forensicProfile')}
                 </p>
                 <h3 className="text-3xl font-display font-bold text-white mb-6 leading-tight group-hover:text-brand transition-colors">{report.title}</h3>
                 <p className="text-white/60 text-lg leading-relaxed mb-12 font-medium">{report.description}</p>
                 
                 <div className="grid grid-cols-2 gap-12 pt-12 border-t border-white/5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-3">{t('classification')}</p>
                      <p className="text-sm font-bold text-white/90">{t(report.category as any) || report.category}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-3">{t('targetEntity')}</p>
                      <p className="text-sm font-bold text-white/90">{t(report.organization as any) || report.organization}</p>
                    </div>
                 </div>
               </div>
            </div>

            <div className="bg-white rounded-[3rem] p-10 flex flex-col justify-between border border-gray-100 shadow-xl shadow-slate-200/50">
               <div>
                  <div className="flex items-center space-x-3 text-slate-900 mb-10 px-5 py-2.5 bg-slate-50 border border-gray-100 rounded-2xl w-fit">
                    <MapPin className="w-4 h-4 text-brand" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t(report.location as any) || report.location}</span>
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">{t('officialDispatchNotes')}</p>
                  <p className="text-base text-slate-600 leading-relaxed font-medium italic border-l-2 border-brand/20 pl-6">
                    {t('dispatchNoteDemo')}
                  </p>
               </div>
               
               <div className="pt-10 space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('protocolActions')}</p>
                  <div className="space-y-2">
                    <button className="w-full bg-brand-dark text-white hover:bg-brand transition-all duration-300 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] flex items-center justify-center group shadow-xl shadow-brand/10">
                      <MessageSquare className="w-4 h-4 mr-3 transition-transform group-hover:-translate-y-0.5" /> {t('secureMessenger')}
                    </button>
                    <button className="w-full bg-white border border-gray-100 hover:border-brand/30 hover:bg-slate-50 transition-all duration-300 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] text-brand/60 flex items-center justify-center">
                      <FileText className="w-4 h-4 mr-3" /> {t('accessArchive')}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
