
import React from 'react';
import { QrCode, BarChart3, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'No App Required',
    desc: 'Customers scan a QR code and connect via Zalo or Web instantly. Zero friction, 100% conversion rate at the table.'
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    desc: 'Track diner behavior and spend in real-time. See exactly who is dining and what they love through our intuitive dashboard.'
  },
  {
    icon: ShieldCheck,
    title: 'CasperID Integration',
    desc: 'Turn every transaction into a loyalty milestone with secure blockchain-backed points and unified digital identity.'
  }
];

export const FeatureGrid: React.FC = () => {
  return (
    <div className="py-24 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col gap-4 mb-16 text-center items-center">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-midnight dark:text-white max-w-2xl">
            The "Invisible" Tech Stack for Physical Dining
          </h2>
          <p className="text-gray-500 max-w-xl">
            Our technology bridges the gap between physical interaction and digital loyalty without the friction of app store downloads.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="group bg-white dark:bg-white/5 p-10 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-primary transition-all hover:shadow-xl hover:-translate-y-2">
              <div className="size-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <f.icon className="w-7 h-7" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-4">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
