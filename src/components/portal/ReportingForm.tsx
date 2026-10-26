import { useState, useEffect, useContext, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  FileText, 
  MapPin, 
  Shield, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  EyeOff,
  Eye,
  ChevronRight,
  ChevronLeft,
  Building2,
  Calendar
} from 'lucide-react';
import { INDUSTRIES, CATEGORIES, DEPARTMENTS } from '../../constants';
import { AppContext } from '../../App';
import { apiService } from '../../services/api';

const formSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(20, 'Please provide more details'),
  category: z.string().min(1, 'Please select a category'),
  organization: z.string().min(1, 'Please select an industry'),
  location: z.string().min(1, 'Please select a department'),
  date: z.string().min(1, 'Please select a date'),
  isAnonymous: z.boolean(),
  reporterName: z.string().optional(),
  reporterEmail: z.string().email('Invalid email').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReportingForm() {
  const { t } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<any[]>(CATEGORIES.map(name => ({ name })));
  const [industries, setIndustries] = useState<any[]>(INDUSTRIES.map(name => ({ name })));
  const [departments, setDepartments] = useState<any[]>(DEPARTMENTS.map(name => ({ name })));

  useEffect(() => {
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
        console.error('Failed to fetch form config', error);
      }
    };
    fetchConfig();
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isAnonymous: false,
      category: '',
      organization: '',
      location: '',
    }
  });

  const isAnonymous = watch('isAnonymous');

  const [files, setFiles] = useState<File[]>([]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const promise = apiService.createReport({
      ...data,
      evidence: files.map(f => f.name),
    });

    toast.promise(promise, {
      loading: t('encryptingReport'),
      success: t('reportSuccess'),
      error: t('reportError'),
    });

    try {
      const result = await promise;
      setTrackingId(result.id);
      setStep(4);
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (step === 1) fieldsToValidate = ['title', 'description', 'category'];
    if (step === 2) fieldsToValidate = ['organization', 'location', 'date'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(s => s + 1);
    } else {
      toast.error('Please fill all required fields correctly');
    }
  };
  const prevStep = () => setStep(s => s - 1);

  if (step === 4 && trackingId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-12 shadow-2xl shadow-brand/10 border border-white/20"
        >
          <div className="w-20 h-20 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">{t('reportSecuredTitle')}</h2>
          <p className="text-gray-500 mb-10 leading-relaxed font-medium">
            {t('reportSecuredDesc')}
          </p>
          
          <div className="bg-brand-dark rounded-[2rem] p-10 mb-10 border border-white/10 relative overflow-hidden text-white shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <Shield className="w-32 h-32" />
             </div>
             <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-3">{t('verifiedTrackingId')}</p>
             <p className="text-4xl font-mono font-bold tracking-tighter">{trackingId}</p>
          </div>

          <button 
            onClick={() => window.location.href = '/track'}
            className="w-full bg-brand text-white py-5 rounded-2xl font-bold hover:brightness-110 shadow-lg shadow-brand/20 transition-all active:scale-[0.98]"
          >
            {t('trackCaseProgress')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full px-4 py-12">
      <div className="bg-brand-muted rounded-[3.5rem] p-8 md:p-16 shadow-2xl shadow-brand/10 border border-brand/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-brand" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="mb-12">
            <div className="flex justify-between items-center mb-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center group flex-1 last:flex-none">
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-sm tracking-tighter transition-all duration-500
                  ${step >= i ? 'bg-brand text-white shadow-2xl shadow-brand/40 ring-4 ring-brand/10' : 'bg-brand/5 text-brand/40 border border-brand/10'}
                `}>
                  {step > i ? <CheckCircle2 className="w-7 h-7" /> : <span className="font-display text-lg text-accent">0{i}</span>}
                </div>
                {i < 3 && (
                  <div className="flex-1 mx-4">
                    <div className="h-[2px] w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: step > i ? '100%' : '0%' }}
                        className="h-full bg-brand transition-all duration-700"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="max-w-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-[2px] bg-brand" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand">
                {step === 1 && t('phase1')}
                {step === 2 && t('phase2')}
                {step === 3 && t('phase3')}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-slate-900 leading-tight">
              {step === 1 && t('incidentProfile')}
              {step === 2 && t('geoLoc')}
              {step === 3 && t('securityRole')}
            </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">{t('mandatoryFieldsDesc')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
          <motion.div
            key="step1"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-brand ml-1">{t('complaintTitle')}</label>
              <input
                {...register('title')}
                placeholder={t('complaintTitlePlaceholder')}
                className="w-full bg-white border-brand/20 border-2 text-slate-800 focus:border-brand focus:ring-8 focus:ring-brand/10 rounded-2xl p-5 transition-all placeholder:text-slate-300 font-medium"
              />
              {errors.title && <p className="text-red-500 text-xs mt-2 font-bold ml-1">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-[0.2em] text-brand ml-1">{t('incidentDescription')}</label>
              <textarea
                {...register('description')}
                rows={5}
                placeholder={t('descriptionPlaceholder')}
                className="w-full bg-white border-brand/20 border-2 text-slate-800 focus:border-brand focus:ring-8 focus:ring-brand/10 rounded-2xl p-5 transition-all placeholder:text-slate-300 font-medium"
              />
              {errors.description && <p className="text-red-500 text-xs mt-2 font-bold ml-1">{errors.description.message}</p>}
            </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.2em] text-brand ml-1">{t('corruptionCategory')}</label>
                <select
                  {...register('category')}
                  className="w-full bg-white border-brand/20 border-2 text-slate-800 focus:border-brand focus:ring-8 focus:ring-brand/10 rounded-2xl p-5 appearance-none font-medium cursor-pointer"
                >
                  <option value="" className="text-gray-400">{t('selectCategory')}</option>
                  {categories.map(c => <option key={c.id || c.name} value={c.name} className="text-slate-800">{t(c.name as any) || c.name}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-2 font-bold ml-1">{errors.category.message}</p>}
              </div>
          </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-brand ml-1">{t('orgDept')}</label>
                  <select
                    {...register('organization')}
                    className="w-full bg-white border-brand/20 border-2 text-slate-800 focus:border-brand focus:ring-8 focus:ring-brand/10 rounded-2xl p-5 cursor-pointer font-medium"
                  >
                    <option value="">{t('selectOrg')}</option>
                    {industries.map(o => <option key={o.id || o.name} value={o.name}>{t(o.name as any) || o.name}</option>)}
                  </select>
                  {errors.organization && <p className="text-red-500 text-xs mt-2 font-bold ml-1">{errors.organization.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-brand ml-1">{t('locationRegion')}</label>
                  <select
                    {...register('location')}
                    className="w-full bg-white border-brand/20 border-2 text-slate-800 focus:border-brand focus:ring-8 focus:ring-brand/10 rounded-2xl p-5 cursor-pointer font-medium"
                  >
                    <option value="">{t('selectLoc')}</option>
                    {departments.map(l => <option key={l.id || l.name} value={l.name}>{t(l.name as any) || l.name}</option>)}
                  </select>
                  {errors.location && <p className="text-red-500 text-xs mt-2 font-bold ml-1">{errors.location.message}</p>}
                </div>
                <div className="space-y-2 col-span-full">
                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-brand ml-1">{t('incidentDate')}</label>
                  <input
                    type="date"
                    {...register('date')}
                    className="w-full bg-white border-brand/20 border-2 text-slate-800 focus:border-brand focus:ring-8 focus:ring-brand/10 rounded-2xl p-5 font-medium"
                  />
                  {errors.date && <p className="text-red-500 text-xs mt-2 font-bold ml-1">{errors.date.message}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-8"
            >
              <div className="bg-brand/5 p-8 rounded-3xl border border-brand/10">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-xl ${isAnonymous ? 'bg-brand text-white' : 'bg-white text-brand border border-gray-200'}`}>
                    {isAnonymous ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold">{t('protectIdentity')}</h3>
                      <input 
                        type="checkbox" 
                        {...register('isAnonymous')}
                        className="w-6 h-6 rounded border-gray-300 text-brand focus:ring-brand"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {t('anonymityDesc')}
                    </p>
                  </div>
                </div>
              </div>

              {!isAnonymous && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-brand ml-1">{t('fullName')}</label>
                    <input
                      {...register('reporterName')}
                      placeholder={t('fullNamePlaceholder')}
                      className="w-full bg-white border-brand/20 border-2 text-slate-800 focus:border-brand focus:ring-8 focus:ring-brand/10 rounded-2xl p-5 transition-all font-medium placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.2em] text-brand ml-1">{t('emailAddress')}</label>
                    <input
                      {...register('reporterEmail')}
                      placeholder={t('emailPlaceholder')}
                      className="w-full bg-white border-brand/20 border-2 text-slate-800 focus:border-brand focus:ring-8 focus:ring-brand/10 rounded-2xl p-5 transition-all font-medium placeholder:text-slate-300"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <label className="text-sm font-bold uppercase tracking-[0.2em] text-brand/60 ml-1">{t('supportingEvidence')}</label>
                <label className="block border-2 border-dashed border-brand/20 bg-gray-50/50 rounded-[2.5rem] p-12 text-center hover:border-brand hover:bg-white transition-all cursor-pointer group shadow-inner relative">
                  <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    onChange={onFileChange}
                  />
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-brand transition-colors" />
                  </div>
                  <p className="text-sm text-brand font-bold mb-1 uppercase tracking-widest">
                    {files.length > 0 ? `${files.length} ${t('filesSelected')}` : t('selectEvidence')}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {files.length > 0 ? files.map(f => f.name).join(', ') : t('uploadLimitsDesc')}
                  </p>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-8 border-t border-brand/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center px-6 py-4 text-sm font-bold text-brand/60 hover:text-brand hover:bg-brand/5 rounded-2xl transition-all"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> {t('back')}
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="bg-brand text-white px-8 py-4 rounded-2xl font-bold flex items-center shadow-lg shadow-brand/10 hover:opacity-90 transition-all active:scale-95"
            >
              {t('continue')} <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand text-white px-12 py-4 rounded-2xl font-bold disabled:opacity-50 shadow-lg shadow-brand/10 hover:scale-105 transition-all"
            >
              {isSubmitting ? t('submitting') : t('submitFinal')}
            </button>
          )}
        </div>
      </form>
    </div>
  </div>
</div>
);
}
