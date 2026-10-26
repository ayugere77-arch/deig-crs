import { useState, useEffect, useContext, FormEvent } from 'react';
import { toast } from 'sonner';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  FileText, 
  CheckCircle, 
  Search, 
  Filter, 
  Download,
  List as ListIcon,
  MapPin,
  Shield,
  Activity,
  Fingerprint,
  LogOut,
  Settings,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { Stats, Report, User } from '../../types';
import DepartmentHeatmap from './RegionalHeatmap';
import { AppContext } from '../../App';
import { apiService } from '../../services/api';

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const { t } = useContext(AppContext)!;
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'analytics' | 'reports' | 'settings'>('analytics');
  
  const [categories, setCategories] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [newItem, setNewItem] = useState({ type: 'category', name: '', description: '' });

  const canSeeAnalytics = user.role === 'Supervisor' || user.role === 'Administrator';
  const canExport = user.role === 'Administrator';

  useEffect(() => {
    fetchStats();
    fetchReports();
    fetchConfig();
  }, [user.role]);

  const fetchConfig = async () => {
    try {
      const [cats, inds, depts] = await Promise.all([
        apiService.getCategories(),
        apiService.getIndustries(),
        apiService.getDepartments()
      ]);
      setCategories(cats);
      setIndustries(inds);
      setDepartments(depts);
    } catch (error) {
      console.error('Failed to fetch config items', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
      setStats(null);
    }
  };

  const fetchReports = async () => {
    try {
      let data = await apiService.getReports();
      
      // Role-based visible reports filtering could go here
      if (user.role === 'Investigator') {
        // Example: logic to restrict to own department or specific cases
      }
      
      setReports(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch reports', error);
      setLoading(false);
    }
  };

  const updateStatus = async (reportId: string, newStatus: string) => {
    const promise = apiService.updateReportStatus(reportId, newStatus);

    toast.promise(promise, {
      loading: `${t('updatingStatus')} ${reportId}...`,
      success: t('statusSyncSuccess'),
      error: t('statusUpdateError'),
    });

    try {
      await promise;
      fetchReports();
      fetchStats();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = () => {
    try {
      const headers = ['ID', 'Tracking ID', 'Title', 'Status', 'Category', 'Location', 'Organization', 'Date'];
      const escapeCSV = (str: any) => {
        const s = String(str);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      };

      const csvData = reports.map(r => [
        r.id,
        r.trackingId || '',
        r.title,
        r.status,
        r.category,
        r.location,
        r.organization,
        new Date(r.createdAt).toLocaleDateString()
      ].map(escapeCSV));
      
      const csvContent = [headers, ...csvData]
        .map(e => e.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `corruption_reports_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(t('exportSuccess') || 'Ledger exported successfully');
    } catch (error) {
      toast.error(t('exportError') || 'Failed to export ledger');
    }
  };

  const handleLogout = () => {
    apiService.logout();
    window.location.reload();
  };

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (newItem.type === 'category') {
        await apiService.addCategory({ name: newItem.name, description: newItem.description });
      } else if (newItem.type === 'industry') {
        await apiService.addIndustry({ name: newItem.name });
      } else if (newItem.type === 'department') {
        await apiService.addDepartment({ name: newItem.name });
      }
      toast.success('Successfully added new item');
      setNewItem({ ...newItem, name: '', description: '' });
      fetchConfig();
      fetchStats(); // Update category distribution if needed
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const COLORS = [
    'var(--color-brand)', 
    '#3b82f6', 
    '#1d4ed8', 
    '#1e40af', 
    'var(--color-accent)'
  ];

  if (loading || !stats) {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center space-y-6 text-center px-4">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 bg-brand/10 rounded-3xl flex items-center justify-center text-brand"
        >
          <Shield className="w-10 h-10" />
        </motion.div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400 animate-pulse mb-2">{t('initializingPipeline')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-40">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-10">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-[1px] bg-brand" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand/60">
              {t('adminConsole')} / AUTH: {t(user.role).toUpperCase()}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 leading-tight">
            {t('caseOversight_1')} <span className="text-brand">{t('caseOversight_2')}</span>
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] hover:text-red-500 transition-colors mr-4"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('signOut')}</span>
          </button>
          <div className="flex items-center bg-white border border-brand/10 rounded-2xl p-1.5 shadow-inner">
            <button 
              onClick={() => setView('analytics')}
              className={`p-3 rounded-xl transition-all ${view === 'analytics' ? 'bg-brand text-white shadow-xl scale-105' : 'text-slate-400 hover:text-brand'}`}
            >
              <Activity className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('reports')}
              className={`p-3 rounded-xl transition-all ${view === 'reports' ? 'bg-brand text-white shadow-xl scale-105' : 'text-slate-400 hover:text-brand'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setView('settings')}
              className={`p-3 rounded-xl transition-all ${view === 'settings' ? 'bg-brand text-white shadow-xl scale-105' : 'text-slate-400 hover:text-brand'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          {canExport && (
            <button 
              onClick={handleExport}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest flex items-center hover:bg-brand transition-all shadow-2xl shadow-brand/10 group"
            >
              <Download className="w-4 h-4 mr-3 transition-transform group-hover:translate-y-0.5" /> {t('exportLedger')}
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
        {[
          { label: t('totalIntake'), value: stats.total, icon: FileText, color: 'text-brand' },
          { label: t('verificationQueue'), value: stats.pending, icon: Search, color: 'text-accent' },
          { label: t('activeInquiry'), value: stats.investigating, icon: Activity, color: 'text-brand' },
          { label: t('successClearance'), value: stats.resolved, icon: CheckCircle, color: 'text-emerald-500' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-brand/30 transition-all duration-700 group"
          >
            <div className={`w-12 h-12 bg-slate-50 ${kpi.color} rounded-xl flex items-center justify-center mb-10 group-hover:bg-brand group-hover:text-white transition-all duration-500`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">{kpi.label}</p>
            <p className="text-4xl font-bold tracking-tighter text-slate-900">{kpi.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Area */}
      {view === 'settings' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-12">
            <h3 className="text-3xl font-bold tracking-tighter text-slate-900 mb-8 flex items-center">
              <Plus className="w-8 h-8 mr-4 text-brand" /> Add New Configuration
            </h3>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Entry Type</label>
                <select 
                  value={newItem.type}
                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none ring-1 ring-inset ring-slate-100 focus:ring-4 focus:ring-brand/10 transition-all"
                >
                  <option value="category">{t('corruptionCategory')}</option>
                  <option value="industry">{t('industryAuth')}</option>
                  <option value="department">{t('departmentAuth')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Name</label>
                <input 
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Enter name..."
                  className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none ring-1 ring-inset ring-slate-100 focus:ring-4 focus:ring-brand/10 transition-all"
                />
              </div>
              <div className="flex items-end">
                <button 
                  type="submit"
                  disabled={!newItem.name}
                  className="w-full bg-brand text-white rounded-2xl p-5 text-sm font-bold uppercase tracking-widest hover:bg-slate-900 transition-all disabled:opacity-50 shadow-xl shadow-brand/10"
                >
                  Save Entry
                </button>
              </div>
              {newItem.type === 'category' && (
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Description</label>
                  <textarea 
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Brief description..."
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm font-bold outline-none ring-1 ring-inset ring-slate-100 focus:ring-4 focus:ring-brand/10 transition-all"
                    rows={2}
                  />
                </div>
              )}
            </form>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-6 border-b border-slate-100 pb-4">{t('industries')}</h4>
              <div className="space-y-3">
                {industries.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-brand/5 transition-colors">
                    <span className="text-xs font-bold text-slate-600 group-hover:text-brand">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-6 border-b border-slate-100 pb-4">{t('departments')}</h4>
              <div className="space-y-3">
                {departments.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl group hover:bg-brand/5 transition-colors">
                    <span className="text-xs font-bold text-slate-600 group-hover:text-brand">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand mb-6 border-b border-slate-100 pb-4">{t('corruptionCategory')}</h4>
              <div className="space-y-3">
                {categories.map((item, i) => (
                  <div key={i} className="flex flex-col p-4 bg-slate-50 rounded-xl group hover:bg-brand/5 transition-colors">
                    <span className="text-xs font-bold text-slate-600 group-hover:text-brand">{item.name}</span>
                    {item.description && <span className="text-[9px] text-slate-400 mt-1">{item.description}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {view === 'analytics' ? (
            canSeeAnalytics ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
                      <Activity className="w-64 h-64" />
                    </div>
                    <div className="flex justify-between items-center mb-12 relative z-10">
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">{t('incidentVelocity')}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('trendAnalysis')}</p>
                      </div>
                    </div>
                    <div className="h-[350px] relative z-10" style={{ minWidth: 0 }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <AreaChart data={stats.trends}>
                          <defs>
                            <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--color-brand)" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="var(--color-brand)" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                          <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 40px 60px -20px rgba(0,0,0,0.1)', background: 'white' }} />
                          <Area type="monotone" dataKey="reports" stroke="var(--color-brand)" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" dot={{ r: 4, fill: '#fff', stroke: 'var(--color-brand)', strokeWidth: 2 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <DepartmentHeatmap data={stats.byLocation} />
                </div>
                <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-brand/5 flex flex-col">
                  <h3 className="font-bold mb-10 flex items-center text-brand"><Shield className="w-5 h-5 mr-3" /> {t('strategicInsight')}</h3>
                  <div className="flex-1 min-h-[250px]" style={{ minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                      <PieChart>
                        <Pie data={stats.byCategory} cx="50%" cy="50%" innerRadius={80} outerRadius={105} paddingAngle={8} dataKey="value">
                          {stats.byCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="relative z-10 max-w-lg mx-auto">
                  <Shield className="w-10 h-10 mx-auto mb-6 text-gray-300" />
                  <h3 className="text-2xl font-bold mb-3">{t('analyticsRestricted')}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8">{t('analyticsRestrictedDesc')}</p>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="bg-white border-b border-gray-100 p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center space-x-6">
                  <h3 className="text-3xl font-bold tracking-tighter text-slate-900">{t('caseLedger')}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('liveFeed')}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/40 group-focus-within:text-brand transition-colors" />
                    <input type="text" placeholder={t('searchIndex')} className="bg-white border border-brand/10 rounded-2xl py-3 pl-12 pr-6 text-xs font-bold font-mono outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all w-64" />
                  </div>
                  <button className="p-3 bg-white border border-brand/10 rounded-2xl hover:bg-brand/5 transition-colors">
                    <Filter className="w-5 h-5 text-brand/40" />
                  </button>
                </div>
              </div>
              <div className="p-2 overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 text-left px-8">
                      <th className="px-8 pb-4">{t('idRef')}</th>
                      <th className="pb-4">{t('incidentProfile')}</th>
                      <th className="pb-4">{t('geoLoc')}</th>
                      <th className="pb-4">{t('deptAuth')}</th>
                      <th className="pb-4">{t('clCat')}</th>
                      <th className="pb-4">{t('phase')}</th>
                      <th className="px-8 pb-4">{t('timestamp')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                          <span className="text-[10px] font-bold font-mono text-brand flex items-center">
                            <Fingerprint className="w-3 h-3 mr-2 opacity-40" />
                            {String(report.trackingId || report.id).substring(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="py-6">
                          <div>
                            <p className="text-xs font-bold text-slate-900 mb-1">{report.title}</p>
                            <p className="text-[9px] text-slate-400 line-clamp-1 max-w-xs">{report.description}</p>
                          </div>
                        </td>
                        <td className="py-6"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t(report.location as any) || report.location}</span></td>
                        <td className="py-6"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t(report.organization as any) || report.organization}</span></td>
                        <td className="py-6"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t(report.category as any) || report.category}</span></td>
                        <td className="py-6">
                          <select 
                            value={report.status} 
                            onChange={(e) => updateStatus(report.id, e.target.value)}
                            className="bg-white border border-brand/10 rounded-full px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest outline-none cursor-pointer"
                          >
                            <option value="Submitted">{t('status1Name')}</option>
                            <option value="Under Review">{t('status2Name')}</option>
                            <option value="Investigation Started">{t('status3Name')}</option>
                            <option value="Resolved">{t('status4Name')}</option>
                            <option value="Dismissed">{t('statusDismissed')}</option>
                          </select>
                        </td>
                        <td className="px-8 py-6 text-[10px] font-bold font-mono text-slate-400">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
