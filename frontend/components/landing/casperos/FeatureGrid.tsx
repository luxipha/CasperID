
import React from 'react';
import { QrCode, BarChart3, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'No Apps, Just Orders',
    desc: 'Guests scan and order in seconds. No downloads, no passwords, no "will do it later." It just works.'
  },
  {
    icon: BarChart3,
    title: 'Know Your VIPs',
    desc: 'See exactly who is sitting at Table 4. Track their favorite dishes, average spend, and visit frequency before they even pay.'
  },
  {
    icon: ShieldCheck,
    title: 'Rewards That Stick',
    desc: 'Turn transactions into relationships. Points are automatically saved to their digital identity, giving them a reason to return next week.'
  }
];

export const FeatureGrid: React.FC = () => {
  return (
    <section className="py-32 bg-background-light dark:bg-background-dark" style={{ backgroundColor: '#ececfd' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col gap-4 mb-16 text-center items-center">
          <h2 className="text-3xl lg:text-5xl font-extrabold max-w-2xl" style={{ color: '#16212c' }}>
            The "Invisible" Waiter for Physical Dining
          </h2>
          <p className="text-gray-500 max-w-xl">
            Service is faster, staff is happier, and guests never have to wave to order or for the check.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="group p-10 rounded-3xl hover:border-primary transition-all hover:shadow-xl hover:-translate-y-2" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="size-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <f.icon className="w-7 h-7" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-bold mb-4" style={{ color: '#16212c' }}>{f.title}</h3>
              <p className="leading-relaxed text-sm" style={{ color: '#16212c' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
