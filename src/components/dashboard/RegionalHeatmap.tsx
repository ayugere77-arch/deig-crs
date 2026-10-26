import { motion } from 'motion/react';
import { MapPin, Info, TrendingUp } from 'lucide-react';
import { useContext } from 'react';
import { AppContext } from '../../App';

const DEPARTMENTS = [
  { name: 'Procurement Department', x: 50, y: 50, size: 40, cases: 452 },
  { name: 'Human Resources (HR)', x: 60, y: 60, size: 30, cases: 284 },
  { name: 'Finance & Accounting', x: 45, y: 35, size: 25, cases: 215 },
  { name: 'Information Technology', x: 48, y: 15, size: 15, cases: 142 },
  { name: 'Legal & Compliance', x: 52, y: 75, size: 12, cases: 89 },
  { name: 'Operational Management', x: 75, y: 45, size: 10, cases: 67 },
];

interface DepartmentHeatmapProps {
  data?: { name: string, cases: number }[];
}

export default function DepartmentHeatmap({ data = [] }: DepartmentHeatmapProps) {
  const { t } = useContext(AppContext)!;
  
  // Merge live data with positions or just use dummy positions for new locations
  const displayDepartments = DEPARTMENTS.map(dept => {
    const realData = data.find(d => d.name === dept.name);
    return {
      ...dept,
      cases: realData ? realData.cases : 0 // Or keep original cases for demo if 0? 
      // Actually, for "correct information", it should be realData.cases or 0.
    };
  });

  return (
    <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            {t('regionalIntensity')}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('geoDesc')}</p>
        </div>
        <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
           <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-brand mr-2" /> {t('critical')}</div>
           <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-slate-300 mr-2" /> {t('nominal')}</div>
        </div>
      </div>

      <div className="relative aspect-video bg-white rounded-[2rem] overflow-hidden border border-brand/10 shadow-inner">
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `radial-gradient(var(--color-brand) 0.5px, transparent 0.5px)`, backgroundSize: '16px 16px' }} />
        
        {/* Placeholder Map SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-[0.08] text-brand">
           <path 
             d="M30 20 L50 10 L70 20 L80 40 L70 70 L50 90 L30 80 L20 50 Z" 
             fill="currentColor" 
             stroke="currentColor" 
             strokeWidth="0.5" 
           />
           <path 
             d="M35 25 L45 15 L65 25 L75 45 L65 75 L45 85 L35 75 L25 45 Z" 
             fill="none" 
             stroke="currentColor" 
             strokeWidth="0.2" 
             strokeDasharray="2 2"
           />
        </svg>

        {/* Hotspots */}
        {displayDepartments.map((region, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: "circOut" }}
            className="absolute group cursor-pointer"
            style={{ left: `${region.x}%`, top: `${region.y}%` }}
          >
            <div 
              className="relative flex items-center justify-center"
              style={{ width: `${region.size * 2}px`, height: `${region.size * 2}px` }}
            >
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.1, 0.2] }}
                 transition={{ duration: 3, repeat: Infinity }}
                 className={`absolute inset-0 rounded-full ${region.cases > 200 ? 'bg-brand' : 'bg-slate-400'}`}
               />
               <div 
                 className={`relative rounded-full shadow-2xl transition-all duration-500 group-hover:scale-125 border-2 border-white ${region.cases > 200 ? 'bg-brand shadow-brand/40' : 'bg-slate-500 shadow-slate-400/40'}`}
                 style={{ width: `${region.size / 1.5}px`, height: `${region.size / 1.5}px` }}
               />
            </div>
            
            <div className="absolute top-1/2 left-full -translate-y-1/2 ml-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0 z-30 pointer-events-none">
              <div className="bg-slate-900 text-white p-5 rounded-[1.5rem] whitespace-nowrap shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border border-white/10 backdrop-blur-xl">
                 <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">{t('regionNode')}</p>
                 <p className="text-xl font-bold tracking-tight mb-4">{t(region.name as any) || region.name}</p>
                 <div className="flex items-center justify-between space-x-10 p-3 bg-white/5 rounded-xl">
                   <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{t('activeCasesLabel')}</span>
                   <span className="text-lg font-mono font-bold text-brand">{region.cases}</span>
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
         {displayDepartments.slice(0, 3).map((r, i) => (
           <div key={i} className="p-6 bg-white border border-brand/10 rounded-2xl group hover:border-brand/30 transition-all duration-500">
             <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 group-hover:text-brand transition-colors">{t(r.name as any) || r.name}</p>
             <div className="flex items-end justify-between">
               <p className="text-3xl font-bold font-display tracking-tighter text-slate-900 leading-none">{r.cases}</p>
               <div className="flex items-center space-x-1">
                 <TrendingUp className="w-3 h-3 text-emerald-500" />
                 <span className="text-[10px] font-bold text-emerald-500">+12.4%</span>
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
