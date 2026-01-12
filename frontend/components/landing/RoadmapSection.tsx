"use client"

import React, { useState } from 'react';

const RoadmapSection: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fullRoadmap = [
    {
      quarter: 'Q1',
      title: 'Identity Foundation (Existence)',
      theme: 'Make CasperID real',
      items: [
        'Core Identity System (Email-based accounts, Public profile pages, Privacy controls)',
        'L2 Verification v1 (One clear flow, Auditable status, Anti-sybil foundation)',
        '.cid Registry MVP (Smart contract, Off-chain resolver + gateway, name.cid routing)',
        'Claim Flow (Web2 UX, Card payments, No wallet exposure required)'
      ],
      outcome: 'Users can say: “This is my CasperID.”'
    },
    {
      quarter: 'Q2',
      title: 'Trust & Distribution (Gravity)',
      theme: 'Make CasperID spread',
      items: [
        'Genesis .cid Campaign (Time-boxed, Community focused, 1:1 verified user)',
        'Verification Signals (Badges on profiles, Visual trust indicators, L2 explanation)',
        'Sharability (Profile share cards, Social optimized .cid links, SEO-friendly profiles)',
        'Basic Analytics (Claim rates, Profile visits, Share conversions)'
      ],
      outcome: '.cid becomes something people share, not just claim.'
    },
    {
      quarter: 'Q3',
      title: 'Monetization & Utility (Value)',
      theme: 'Make identity useful',
      items: [
        'Paid .cid Expansion ($5 one-time, Premium names, Business .cid early access)',
        'Earn v1 (Controlled rewards for reviews/feedback, Identity-gated)',
        'Partner Integrations (First use cases: Reviews, Referrals, Identity checks)',
        'Abuse & Fraud Controls (Rate limits, Identity scoring, Manual flags)'
      ],
      outcome: 'CasperID stops being “just identity” and becomes economically relevant.'
    },
    {
      quarter: 'Q4',
      title: 'Platform Expansion (Moat)',
      theme: 'Make CasperID hard to replace',
      items: [
        'Advanced Identity Controls (Device management, Optional passkeys, Recovery flows)',
        'Developer Access (Limited .cid resolve & lookup APIs, Usage policies)',
        'Business & Enterprise Pilot (Verified business profiles, Paid verification tiers)',
        '2027 Readiness (Governance model drafted, Self-custody export, Regulatory review)'
      ],
      outcome: 'CasperID becomes infrastructure, not a feature.'
    }
  ];

  const mainViewFeatures = [
    {
      title: 'L2 Verification v1',
      description: 'A single, clear verification flow with auditable status storage to establish trust, reduce fraud, forming the foundation for anti-sybil protection.',
      color: 'primary'
    },
    {
      title: '.cid Registry (MVP)',
      description: 'The first CasperID naming layer. This enables human-readable identity that works across Web2 and Web3.',
      bullets: [
        'Smart contract deployed',
        'Off-chain resolver + gateway',
        'name.cid → profile routing'
      ],
      icon: 'language',
      color: 'secondary'
    },
    {
      title: 'Claim Flow (Web2-First UX)',
      description: 'Claim and activate your CasperID without crypto complexity. Optimized for mainstream users and businesses.',
      icon: 'payments',
      color: 'pink-500'
    }
  ];

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white border-t border-slate-200 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-6 md:gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-4 md:mb-6 leading-tight">Our Roadmap</h2>
            <p className="text-xl text-slate-600 text-slate-500 font-medium leading-relaxed">
              A high-level view of our development progress and focus areas.
              We are committed to building the future of decentralized identity in public.
            </p>
          </div>
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="inline-flex px-8 py-4 rounded-full border-2 border-slate-200 text-slate-900 font-bold hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 transition-all items-center gap-3 shadow-lg group"
          >
            View Detailed Plans <span className="group-hover:translate-x-1 transition-transform text-xl">→</span>
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-start">
          {/* Left Side: Current Sprint Card */}
          <div className="relative group lg:sticky lg:top-32">
            <div className="absolute -inset-2 bg-gradient-to-tr from-purple-600 via-purple-500 to-blue-500 rounded-[2rem] md:rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-blue-600 rounded-[1.5rem] md:rounded-[2.5rem] p-6 sm:p-10 md:p-14 text-white shadow-2xl overflow-hidden min-h-[350px] md:min-h-[450px] flex flex-col justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="relative z-10 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 gap-4">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">Current Sprint</h3>
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    <span className="text-xs font-black uppercase tracking-widest">Active</span>
                  </div>
                </div>

                <div className="mb-14">
                  <div className="flex justify-between items-end mb-4">
                    <span className="text-xs font-black text-white/70 uppercase tracking-[0.2em]">Overall Progress</span>
                    <span className="text-4xl font-black font-mono text-blue-400">40%</span>
                  </div>
                  <div className="h-4 bg-black/40 rounded-full overflow-hidden backdrop-blur-md border border-white/5 p-1">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full relative shadow-[0_0_20px_rgba(0,240,255,0.6)]"
                      style={{ width: '40%' }}
                    ></div>
                  </div>
                </div>

                <div className="bg-black/20 rounded-3xl p-8 border border-white/10 backdrop-blur-xl group-hover:bg-black/30 transition-all">
                  <div className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em] mb-4">Current Focus</div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-black text-2xl mb-2">Core Identity System</div>
                      <div className="text-white/70 font-medium leading-relaxed">
                        A simple, auditable identity foundation designed for real-world adoption—starting with hospitality and local businesses.
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mb-1">Target</div>
                      <div className="font-black text-2xl text-blue-400">Q1 2026</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Features List */}
          <div className="space-y-10 md:space-y-16">
            {mainViewFeatures.map((feature, idx) => (
              <div key={idx} className="flex gap-4 md:gap-8 group cursor-pointer" onClick={() => setIsDrawerOpen(true)}>
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-purple-200 dark:border-purple-800">
                  <span className="text-purple-600 text-xl md:text-3xl">{feature.icon === 'verified_user' ? '✓' : feature.icon === 'language' ? '🌐' : '💳'}</span>
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-2 md:mb-3 group-hover:text-purple-600 transition-colors leading-tight">
                    {feature.title}
                  </h4>
                  <p className="text-base md:text-lg text-slate-600 text-slate-500 leading-relaxed font-medium mb-4">
                    {feature.description}
                  </p>
                  {feature.bullets && (
                    <ul className="space-y-2">
                      {feature.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="flex items-center gap-3 text-sm font-bold text-slate-600 text-slate-500 opacity-80">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600/40 shrink-0"></span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side Panel Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          ></div>

          <div className="fixed inset-y-0 right-0 w-full max-w-2xl flex">
            <div className="h-full w-full bg-white shadow-2xl flex flex-col transition-all duration-500 border-l border-slate-200">
              <div className="p-8 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-lg z-10">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">2026 Roadmap</h3>
                  <p className="text-sm font-bold text-purple-600 uppercase tracking-[0.2em] mt-1">Adevar / CasperID Detail Plan</p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-colors"
                >
                  <span className="text-3xl">✕</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-16">
                {fullRoadmap.map((section, idx) => (
                  <div key={idx} className="relative group">
                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-600 to-transparent opacity-20"></div>

                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-black text-purple-600 uppercase tracking-widest mb-1">{section.quarter} Phase</div>
                        <h4 className="text-2xl font-black text-slate-900">{section.title}</h4>
                      </div>
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-black text-slate-600 text-slate-500 uppercase tracking-widest border border-slate-200 px-3 py-1 rounded-lg">
                          {idx === 0 ? 'Foundation' : idx === 1 ? 'Growth' : idx === 2 ? 'Utility' : 'Infrastructure'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 border-slate-100">
                      <p className="text-sm font-bold text-slate-600 text-slate-500 uppercase tracking-widest">Theme</p>
                      <p className="text-lg font-black text-slate-900">{section.theme}</p>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <div className="text-[10px] font-black text-slate-600 text-slate-500 uppercase tracking-[0.3em] mb-4">What must ship</div>
                        <ul className="space-y-5">
                          {section.items.map((item, i) => (
                            <li key={i} className="flex gap-4 text-base sm:text-lg text-slate-900/90 font-medium leading-relaxed group/item">
                              <span className="w-2 h-2 rounded-full bg-purple-600 mt-2.5 shrink-0 shadow-[0_0_8px_rgba(134,82,226,0.4)]"></span>
                              <span className="group-hover/item:text-purple-600 transition-colors">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-purple-600/5 bg-purple-50 rounded-3xl p-6 border border-purple-600/10 shadow-inner">
                        <div className="text-[10px] font-black text-purple-600/70 text-purple-600/70 uppercase tracking-[0.3em] mb-2">Target Outcome</div>
                        <p className="text-lg font-black italic text-slate-900 leading-snug">"{section.outcome}"</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-12 border-t border-slate-100 border-slate-100 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-blue-500 text-2xl">🗺️</span>
                    <h4 className="text-2xl font-black text-slate-900">Beyond 2026</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      'Governance model drafted',
                      'Self-custody export options',
                      'Regulatory posture review',
                      'Platform defensive moat completion'
                    ].map((text, i) => (
                      <div key={i} className="px-5 py-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-sm font-bold text-slate-900/80 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 backdrop-blur-md border-t border-slate-200">
                <button
                  className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-[1.02] transition-all shadow-xl uppercase tracking-widest text-sm"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  Close Detail Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RoadmapSection;
