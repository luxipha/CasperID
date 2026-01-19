
import React, { useState } from 'react';
import { X, ArrowRight, CheckCircle2, Building2, Users, Mail, Loader2 } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: '',
    restaurantType: 'Bistro',
    locations: '1-2',
    monthlyVolume: 'Under $50k',
    name: '',
    email: ''
  });

  if (!isOpen) return null;

  const totalSteps = 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        setStep(4); // Success step
      }, 1500);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-midnight/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-background-dark w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-white/10">
        
        {/* Progress Bar */}
        {step <= totalSteps && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-100 dark:bg-white/5">
            <div 
              className="h-full bg-primary transition-all duration-500" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>
        )}

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-midnight dark:hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-10 lg:p-14">
          
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-4 text-primary">
                <Building2 size={32} />
                <h2 className="text-3xl font-black tracking-tight">Tell us about your restaurant</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Restaurant Name</label>
                  <input 
                    type="text" 
                    value={formData.restaurantName}
                    onChange={(e) => updateField('restaurantName', e.target.value)}
                    placeholder="e.g. Hearth & Vine"
                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Establishment Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Bistro', 'Fine Dining', 'Quick Service', 'Bar/Lounge'].map((type) => (
                      <button
                        key={type}
                        onClick={() => updateField('restaurantType', type)}
                        className={`py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                          formData.restaurantType === type 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-transparent bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-4 text-primary">
                <Users size={32} />
                <h2 className="text-3xl font-black tracking-tight">What is your scale?</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Number of Locations</label>
                  <div className="flex flex-wrap gap-2">
                    {['1-2', '3-10', '10-50', '50+'].map((val) => (
                      <button
                        key={val}
                        onClick={() => updateField('locations', val)}
                        className={`flex-grow py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                          formData.locations === val 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-transparent bg-gray-50 dark:bg-white/5 text-gray-400'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Monthly Transaction Volume</label>
                  <div className="flex flex-wrap gap-2">
                    {['Under $50k', '$50k-$200k', 'Over $200k'].map((val) => (
                      <button
                        key={val}
                        onClick={() => updateField('monthlyVolume', val)}
                        className={`flex-grow py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                          formData.monthlyVolume === val 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-transparent bg-gray-50 dark:bg-white/5 text-gray-400'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="flex items-center gap-4 text-primary">
                <Mail size={32} />
                <h2 className="text-3xl font-black tracking-tight">How can we reach you?</h2>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Your Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Alex Nguyen"
                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Business Email</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="alex@bistroprime.com"
                    className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-primary transition-all font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6 space-y-8 animate-in zoom-in-95 duration-500">
              <div className="size-24 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500/20">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black tracking-tight">Request Received!</h2>
                <p className="text-gray-500 font-medium">Our team will reach out to schedule your personalized strategy session.</p>
              </div>
              
              <div className="p-8 bg-primary/10 rounded-3xl border border-primary/20 space-y-4">
                <p className="text-sm font-bold text-primary tracking-wide uppercase">While you wait...</p>
                <p className="text-sm font-medium">Would you like to explore the interactive product dashboard right now?</p>
                <button 
                  onClick={onComplete}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                  Enter Interactive Demo
                </button>
              </div>
            </div>
          )}

          {step <= totalSteps && (
            <div className="mt-12 flex items-center justify-between gap-4">
              <div className="flex gap-1.5">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-primary' : 'w-2 bg-gray-200 dark:bg-white/10'}`}></div>
                ))}
              </div>
              <button 
                onClick={handleNext}
                disabled={loading}
                className="bg-midnight dark:bg-white text-white dark:text-midnight px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:opacity-90 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <>
                    {step === totalSteps ? 'Book Demo' : 'Continue'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
