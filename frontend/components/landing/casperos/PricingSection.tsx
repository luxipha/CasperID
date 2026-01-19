
import React from 'react';
import { Check, Zap } from 'lucide-react';

interface PricingSectionProps {
  onCtaClick: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onCtaClick }) => {
  const tiers = [
    {
      name: 'Starter',
      price: '$15',
      desc: 'Perfect for single-location bistros starting their digital journey.',
      features: [
        '1 Location',
        'Zalo Web Integration',
        'Basic Guest Analytics',
        'Digital Menu QR',
        'Email Support'
      ],
      highlight: false
    },
    {
      name: 'Professional',
      price: '$70',
      desc: 'Advanced tools for growing groups focused on retention.',
      features: [
        'Up to 5 Locations',
        'ZaloPay Integration',
        'CasperID Loyalty Engine',
        'Advanced Intent Analytics',
        'Social Group Carts',
        'Priority Support'
      ],
      highlight: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'Tailored solutions for large franchises and legacy operations.',
      features: [
        'Unlimited Locations',
        'Legacy POS Integration (Oracle/Micros)',
        'White-label Experience',
        'Dedicated Account Manager',
        'API Access',
        'On-site Training'
      ],
      highlight: false
    }
  ];

  return (
    <section id="pricing" className="py-32 bg-white dark:bg-background-dark/80 relative overflow-hidden" style={{ backgroundColor: '#F9F9F9' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 tracking-tight" style={{ color: '#2d3e50' }}>Transparent Pricing</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Choose the scale that fits your hospitality vision. No hidden setup fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, i) => (
            <div
              key={i}
              className={`rounded-[2.5rem] p-10 transition-all hover:-translate-y-2 ${tier.highlight
                ? 'text-white shadow-2xl shadow-primary/30 border-2 border-primary scale-105'
                : 'border-2 border-gray-100'
                }`}
              style={tier.highlight ? { backgroundColor: '#2d3e50', color: '#FFFFFF' } : { backgroundColor: '#FFFFFF', color: '#2d3e50' }}
            >
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                  <Zap size={10} fill="currentColor" />
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-xl font-bold mb-2 ${tier.highlight ? 'text-white' : 'text-midnight dark:text-white'}`}>{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black">{tier.price}</span>
                  {tier.price !== 'Custom' && <span className="text-sm font-bold opacity-60">/mo</span>}
                </div>
                <p className={`text-sm leading-relaxed ${tier.highlight ? 'text-gray-400' : 'text-gray-500'}`}>
                  {tier.desc}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0 ${tier.highlight ? 'bg-primary/20 text-primary' : 'bg-gray-100 dark:bg-white/10 text-primary'}`}>
                      <Check size={12} strokeWidth={4} />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={onCtaClick}
                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${tier.highlight
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20'
                  : 'text-white hover:opacity-90'
                  }`}
                style={!tier.highlight ? { backgroundColor: '#2d3e50' } : {}}
              >
                {tier.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
