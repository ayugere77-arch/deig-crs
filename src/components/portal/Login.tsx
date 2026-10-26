import { useState, useContext, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { AppContext } from '../../App';
import { apiService } from '../../services/api';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { t } = useContext(AppContext)!;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiService.login({ email, password });
      toast.success(`${t('welcomeBack')}, ${data.user.name}`);
      onLogin(data.user);
    } catch (error) {
      toast.error(t('systemError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand/5 mb-6">
            <Shield className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">{t('staffAuth')}</h1>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{t('restrictedFederal')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder={t('instEmail')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-sm"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder={t('accessKey')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full py-4 bg-brand text-white rounded-2xl font-bold text-sm uppercase tracking-widest overflow-hidden transition-all hover:bg-brand-dark disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center justify-center">
              {loading ? t('verifyingIdentity') : t('authorizeAccess')}
              {!loading && <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />}
            </span>
          </button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 text-center">Demo Staff Accounts (Click to Autofill)</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@deig.gov.et');
                setPassword('admin123');
              }}
              className="p-2.5 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-gray-800">Federal Inspector</div>
              <div className="text-[10px] text-gray-500 font-mono truncate">admin@deig.gov.et</div>
              <div className="text-[9px] text-brand font-medium">Role: Admin</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('investigator@deig.gov.et');
                setPassword('investigator123');
              }}
              className="p-2.5 text-left bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-xl transition-colors cursor-pointer"
            >
              <div className="text-[11px] font-bold text-gray-800">Lead Investigator</div>
              <div className="text-[10px] text-gray-500 font-mono truncate">investigator@deig.gov.et</div>
              <div className="text-[9px] text-emerald-600 font-medium">Role: Investigator</div>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
            {t('unauthorizedWarning')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
