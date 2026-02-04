
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const IntegrationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tier, setTier] = useState('L2');
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full relative">
      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-text-main/90 backdrop-blur-lg text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
          <span className="material-symbols-outlined text-green-400 !text-xl">check_circle</span>
          <p className="text-sm font-bold">Changes saved successfully!</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/business/integrations')}
            className="text-text-muted hover:text-text-main flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
            <span className="text-sm font-medium">Back to Integrations</span>
          </button>
        </div>
        <button
          onClick={handleSave}
          className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
          Save Changes
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-text-main text-3xl font-black tracking-tight">Integration: {id?.replace('-', ' ')}</h2>
          <div className="flex gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">Active</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">Verified</span>
          </div>
        </div>
        <p className="text-text-muted">Unique ID: <span className="font-mono text-xs">app_72d3f9b2-0c1a-4e8c-8f97</span></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30">
              <h3 className="font-bold text-text-main">App Configuration</h3>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">App Name</label>
                <input className="w-full rounded-lg border-border-muted bg-background-light/50 focus:border-primary focus:ring-primary text-sm p-3" defaultValue="Uniswap Clone" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">App Website</label>
                <input className="w-full rounded-lg border-border-muted bg-background-light/50 focus:border-primary focus:ring-primary text-sm p-3" defaultValue="https://uniswap-clone.io" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-main">App Logo</label>
                <div className="flex items-center gap-4 mt-1">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-dashed border-primary">
                    <span className="material-symbols-outlined !text-3xl text-primary">image</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="text-sm font-bold text-primary hover:underline text-left">Upload new logo</button>
                    <p className="text-xs text-text-muted">SVG, PNG or JPG (max. 500x500px)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30 flex justify-between items-center">
              <h3 className="font-bold text-text-main">Redirect Configuration</h3>
              <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                <span className="material-symbols-outlined !text-sm">add</span> Add URL
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <p className="text-xs text-text-muted">Users will only be redirected back to these specific URLs after a successful authentication.</p>
              <div className="flex flex-col gap-2">
                {['https://uniswap-clone.io/auth/callback', 'http://localhost:3000/callback'].map((url, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className="flex-1 rounded-lg border-border-muted bg-background-light/30 text-sm p-3 text-text-muted" readOnly value={url} />
                    <button className="p-2 text-text-muted hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined !text-xl">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="bg-white rounded-xl border border-border-muted shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-muted bg-background-light/30">
              <h3 className="font-bold text-text-main">Verification Requirements</h3>
            </div>
            <div className="p-6 flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <label className="text-sm font-bold text-text-main">Required Trust Tier</label>
                <div className="grid grid-cols-3 gap-3">
                  {['L1', 'L2', 'L3'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTier(t)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all text-center gap-1 ${tier === t ? 'border-primary bg-primary/5' : 'border-border-muted hover:border-primary/50'
                        }`}
                    >
                      <span className={`text-lg font-black ${tier === t ? 'text-primary' : 'text-text-main'}`}>{t}</span>
                      <span className={`text-[10px] uppercase font-bold ${tier === t ? 'text-primary' : 'text-text-muted'}`}>
                        {t === 'L1' ? 'Basic' : t === 'L2' ? 'Verified' : 'Premium'}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-text-muted italic">Higher tiers provide more robust identity assurance but may reduce conversion.</p>
              </div>
              <hr className="border-border-muted" />
              <div className="flex flex-col gap-4">
                <label className="text-sm font-bold text-text-main">Specific Proofs Required</label>
                <div className="flex flex-col gap-4">
                  {[
                    { id: 'liveness', label: 'Verify Liveness', sub: 'Biometric face-matching check', checked: true },
                    { id: 'age', label: 'Verify Age', sub: 'Confirm user is 18+ years old', checked: false },
                    { id: 'email', label: 'Email Verification', sub: 'Require verified primary email', checked: true },
                  ].map((proof) => (
                    <div key={proof.id} className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-text-main">{proof.label}</span>
                        <span className="text-xs text-text-muted">{proof.sub}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={proof.checked} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationDetail;
