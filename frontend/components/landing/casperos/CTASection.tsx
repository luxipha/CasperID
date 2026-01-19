
import React from 'react';
import { Soup } from 'lucide-react';

interface CTASectionProps {
  onDemoClick?: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onDemoClick }) => {
  return (
    <section className="py-32 bg-white dark:bg-background-dark relative overflow-hidden" style={{ backgroundColor: '#fcfbfe' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-primary rounded-[3rem] p-12 lg:p-20 text-center flex flex-col items-center gap-8 shadow-2xl shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Soup size={200} className="-rotate-12 text-white" strokeWidth={1} />
          </div>
          <h2 className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight relative z-10">
            Ready to digitize your <br className="hidden md:block" /> dining experience?
          </h2>
          <p className="text-white/80 text-lg max-w-xl relative z-10 font-medium">
            Join 500+ premium restaurants using RestoTech to build deeper relationships with their guests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            <button
              onClick={onDemoClick}
              className="bg-midnight text-white px-10 py-5 rounded-2xl font-extrabold text-lg hover:bg-midnight/90 transition-all shadow-xl"
            >
              Get Started for Free
            </button>
            <button
              onClick={onDemoClick}
              className="bg-white text-primary px-10 py-5 rounded-2xl font-extrabold text-lg hover:bg-gray-50 transition-all shadow-xl"
            >
              Schedule a Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
