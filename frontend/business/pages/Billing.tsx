
import React, { useState } from 'react';

const Billing: React.FC = () => {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Manage Subscription Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-text-main">Manage Subscription</h3>
              <button onClick={() => setIsManageModalOpen(false)} className="text-text-muted hover:text-text-main">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-background-light rounded-2xl flex items-center justify-between border border-border-muted">
                <div className="flex flex-col">
                  <span className="text-xs text-text-muted font-bold uppercase">Active Plan</span>
                  <span className="font-black text-text-main text-lg">Developer Plus</span>
                </div>
                <span className="text-primary font-black">$45/mo</span>
              </div>
              <div className="space-y-4">
                <button className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg">Change Plan</button>
                <button className="w-full py-3 border border-border-muted text-text-main font-bold rounded-xl hover:bg-background-light transition-all">Update Payment Method</button>
                <button className="w-full py-3 text-red-500 font-bold text-sm hover:underline">Cancel Subscription</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h2 className="text-text-main text-3xl font-black tracking-tight">Billing & Usage</h2>
        <p className="text-text-muted">Manage your subscription plan, payment methods, and monitor usage metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col justify-between rounded-xl bg-white p-6 border border-border-muted shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-text-muted text-sm font-medium">Current Plan</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">Active</span>
            </div>
            <h3 className="text-text-main text-2xl font-bold">Developer Plus</h3>
            <div className="flex flex-col gap-1 mt-4">
              <p className="text-text-muted text-xs uppercase font-bold tracking-wider">Next Payout</p>
              <p className="text-text-main text-3xl font-black">$45.00 <span className="text-sm font-medium text-text-muted">/ month</span></p>
              <p className="text-xs text-text-muted mt-1">Next billing date: Oct 24, 2023</p>
            </div>
          </div>
          <button 
            onClick={() => setIsManageModalOpen(true)}
            className="mt-8 w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            Manage Plan
          </button>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6 rounded-xl bg-white p-6 border border-border-muted shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-text-main font-bold">Usage Metrics</h3>
            <span className="text-xs text-text-muted font-medium italic">Current billing cycle</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-text-main">Verifications</span>
                <span className="text-xs font-bold text-primary">82%</span>
              </div>
              <div className="w-full bg-border-muted h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: '82%' }}></div>
              </div>
              <p className="text-xs text-text-muted">8,200 / 10,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
