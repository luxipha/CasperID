
import React from 'react';
import { BadgeCheck, PlayCircle, TrendingUp, Fingerprint } from 'lucide-react';

interface HeroProps {
  onCtaClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  const heroImage = "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=1200";

  return (
    <div className="relative overflow-hidden pt-12 pb-24 lg:pt-20" style={{ backgroundColor: '#ececfd' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="flex flex-col gap-8 transition-all duration-1000">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full w-fit">
              <BadgeCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Next-Gen Hospitality</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-midnight dark:text-white">
              <span style={{ color: '#16212c' }}>Turn Anonymous Diners Into</span> <span className="text-primary">Lifelong Guests</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
              No apps to download. Seamless Zalo & Web integration. The loyalty platform built for the modern bistro. Identify every guest with CasperID.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onCtaClick}
                className="bg-primary text-white font-bold px-8 py-4 rounded-xl hover:scale-105 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                Schedule a Demo
              </button>
              <a
                href="#pricing"
                className="text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 hover:scale-105 transition-all duration-300"
                style={{ backgroundColor: '#16212c' }}
              >
                <PlayCircle className="w-5 h-5" />
                See Pricing
              </a>
            </div>
          </div>
          <div className="relative h-[500px] lg:h-[600px] w-full">
            <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl rotate-3 scale-95 opacity-20 bg-primary/20"></div>
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-center bg-cover"
              style={{ backgroundImage: `url(${heroImage})` }}
            ></div>

            {/* Live Analytics Card with float animation */}
            <div className="absolute -bottom-6 -left-6 lg:-left-12 glass-morphism p-6 rounded-2xl shadow-2xl w-72 flex flex-col gap-4 animate-float">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-midnight/60 dark:text-white/60">Live Analytics</span>
                <TrendingUp className="text-primary w-5 h-5" />
              </div>
              <div className="space-y-3">
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[72%] transition-all duration-1000"></div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-extrabold">1,284</p>
                    <p className="text-[10px] font-bold text-midnight/60 dark:text-white/60">Known Customers</p>
                  </div>
                  <span className="text-xs font-bold text-green-500">+12%</span>
                </div>
              </div>
            </div>

            {/* CasperID Card with delayed float animation */}
            <div className="absolute top-12 -right-6 lg:-right-10 glass-morphism p-5 rounded-2xl shadow-2xl w-64 animate-float-delayed">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 bg-midnight rounded-full flex items-center justify-center">
                  <Fingerprint className="text-white w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-extrabold leading-none">CasperID</p>
                  <p className="text-[10px] text-midnight/60 dark:text-white/60">Verified Identity</p>
                </div>
              </div>
              <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                <p className="text-[10px] font-bold mb-1 opacity-60">Reward Points</p>
                <p className="text-lg font-bold text-primary">4,500 CSPR</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
