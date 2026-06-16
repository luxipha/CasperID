import React from 'react';
import { BadgeCheck, Code2, Globe, Layers3, ShieldCheck } from 'lucide-react';

const milestones = [
  {
    quarter: 'Q1',
    title: 'Identity foundation',
    summary: 'Public profiles, core identity primitives, and auditable verification.',
    icon: ShieldCheck,
    bullets: [
      'Core identity system',
      'L2 verification v1',
      '.cid registry MVP',
    ],
    status: 'Done',
  },
  {
    quarter: 'Q2',
    title: 'Trust and distribution',
    summary: 'Make CasperID easier to share, recognize, and trust across the web.',
    icon: Globe,
    bullets: [
      'Genesis .cid campaign',
      'Verification signals',
      'Sharable public profiles',
    ],
    status: 'In progress',
  },
  {
    quarter: 'Q3',
    title: 'Utility and integrations',
    summary: 'Expand product utility with partner flows, rewards, and fraud controls.',
    icon: BadgeCheck,
    bullets: [
      'Paid .cid expansion',
      'Partner integrations',
      'Abuse and fraud controls',
    ],
    status: 'Planned',
  },
  {
    quarter: 'Q4',
    title: 'Platform expansion',
    summary: 'Broaden developer access and prepare the platform for enterprise use.',
    icon: Code2,
    bullets: [
      'Developer APIs',
      'Business and enterprise pilot',
      'Governance and export readiness',
    ],
    status: 'Planned',
  },
];

const Roadmap: React.FC = () => {
  return (
    <section id="roadmap" className="relative w-full py-20 md:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(230,126,34,0.08),transparent_26%),radial-gradient(circle_at_85%_20%,rgba(109,232,236,0.1),transparent_20%),linear-gradient(180deg,rgba(248,250,252,0.7),rgba(255,255,255,0.96))]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-slate-600 shadow-sm">
            <Layers3 className="h-3.5 w-3.5 text-primary" />
            Roadmap
          </div>
          <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            What we&apos;re shipping next
          </h2>
          <p className="mt-4 max-w-2xl text-base md:text-lg leading-8 text-slate-600">
            A focused product roadmap across identity, trust, integrations, and platform access.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {milestones.map((milestone) => {
            const Icon = milestone.icon;

            return (
              <article
                key={milestone.quarter}
                className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                    milestone.status === 'In progress'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {milestone.status}
                  </span>
                </div>

                <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                  {milestone.quarter}
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                  {milestone.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {milestone.summary}
                </p>

                <ul className="mt-5 space-y-3">
                  {milestone.bullets.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-700">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
