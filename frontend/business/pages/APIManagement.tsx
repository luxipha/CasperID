
import React, { useState } from 'react';

const APIManagement: React.FC = () => {
  const [showSecret, setShowSecret] = useState(false);
  const [env, setEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleRotate = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-text-main/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
          <span className="material-symbols-outlined text-green-400 !text-xl">autorenew</span>
          <p className="text-sm font-bold">Secret rotated. Update your environment variables.</p>
        </div>
      </div>

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-black text-text-main tracking-tight">Select a Plan</h3>
                <p className="text-sm text-text-muted">Scale your operations with higher quotas and advanced tools.</p>
              </div>
              <button onClick={() => setIsUpgradeModalOpen(false)} className="text-text-muted hover:text-text-main">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { name: 'Standard', price: '$0', desc: 'For individuals', features: ['1000 requests/mo', 'Basic support'] },
                { name: 'Developer', price: '$45', desc: 'For growing apps', features: ['10k requests/mo', 'Priority support', 'Webhooks'], popular: true },
                { name: 'Enterprise', price: 'Custom', desc: 'Full-scale needs', features: ['Unlimited calls', '24/7 Support', 'Custom Tiers'] },
              ].map((p, i) => (
                <div key={i} className={`p-6 rounded-2xl border-2 flex flex-col gap-4 ${p.popular ? 'border-primary bg-primary/5' : 'border-border-muted'}`}>
                  {p.popular && <span className="bg-primary text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full w-fit">Most Popular</span>}
                  <div className="flex flex-col">
                    <h4 className="font-bold text-text-main">{p.name}</h4>
                    <p className="text-2xl font-black text-text-main">{p.price}</p>
                    <p className="text-xs text-text-muted">{p.desc}</p>
                  </div>
                  <ul className="space-y-2 mt-4 flex-1">
                    {p.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-xs font-medium text-text-main">
                        <span className="material-symbols-outlined !text-xs text-primary">check</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${p.popular ? 'bg-primary text-white shadow-lg' : 'bg-background-light text-text-muted hover:bg-border-muted'}`}>Select {p.name}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-main text-3xl font-black tracking-tight">API Management</h2>
          <p className="text-text-muted">Manage your organization's API credentials and environment settings.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-border-muted rounded-xl text-sm font-bold text-text-main hover:bg-background-light transition-colors">
          <span className="material-symbols-outlined !text-lg">download</span> Export Config
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border-muted flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-text-main flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">vm_group</span> Client Credentials
                </h3>
                <div className="flex items-center bg-background-light border border-border-muted rounded-xl p-1">
                  <button
                    onClick={() => setEnv('sandbox')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${env === 'sandbox' ? 'bg-white shadow-sm border border-border-muted' : 'text-text-muted'}`}
                  >
                    Sandbox
                  </button>
                  <button
                    onClick={() => setEnv('production')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${env === 'production' ? 'bg-white shadow-sm border border-border-muted text-text-main font-bold' : 'text-text-muted'}`}
                  >
                    Production
                  </button>
                </div>
              </div>
              <button 
                onClick={handleRotate}
                className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 group"
              >
                <span className="material-symbols-outlined !text-sm group-hover:animate-spin">refresh</span> Rotate Secret
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Client ID</label>
                  <div className="flex items-center gap-2 p-3 bg-background-light rounded-lg border border-border-muted">
                    <code className="text-sm text-text-main flex-1 font-mono">cid_8333366eac5a4896a869</code>
                    <button className="text-text-muted hover:text-primary transition-colors">
                      <span className="material-symbols-outlined !text-lg">content_copy</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">API Secret</label>
                  <div className="flex items-center gap-2 p-3 bg-background-light rounded-lg border border-border-muted">
                    <code className="text-sm text-text-main flex-1 font-mono">
                      {showSecret ? 'sk_test_7a92h-b12k-8j12-98aa-12903z' : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <button onClick={() => setShowSecret(!showSecret)} className="text-text-muted hover:text-primary transition-colors">
                      <span className="material-symbols-outlined !text-lg">{showSecret ? 'visibility_off' : 'visibility'}</span>
                    </button>
                    <button className="text-text-muted hover:text-primary transition-colors">
                      <span className="material-symbols-outlined !text-lg">content_copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-border-muted shadow-sm p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-text-main">Monthly Usage</h3>
              <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase rounded leading-none">Tier 2 Plan</span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <p className="text-2xl font-bold text-text-main">750<span className="text-text-muted text-base font-normal">/1,000</span></p>
                  <p className="text-xs text-text-muted">API Calls this month</p>
                </div>
                <span className="text-sm font-bold text-primary">75%</span>
              </div>
              <div className="w-full bg-border-muted h-2 rounded-full mt-1 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
              <button 
                onClick={() => setIsUpgradeModalOpen(true)}
                className="w-full py-2.5 bg-white border border-primary text-primary text-sm font-bold rounded-lg hover:bg-primary/5 transition-colors"
              >
                Upgrade Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIManagement;
