"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const steps = [
  {
    title: "Higher-level Abstractions",
    copy: "A task-based view of agent activity with just the artifacts you need to build trust.",
    bullets: [
      "Monitor agent tasks with concise summaries.",
      "Review key artifacts without digging through logs.",
      "Verify steps, progress, and outcomes at a glance.",
      "Keep everything auditable while staying fast.",
    ],
    image: "/images/step-1.png",
    bgColor: "#f1f5f9",
  },
  {
    title: "Verified Profiles",
    copy: "Share only what's needed, with cryptographic proof and clear consent.",
    bullets: ["One-tap verification", "Scoped data sharing", "Revocable access"],
    image: "/images/step-2.png",
    bgColor: "#e0f2fe",
  },
  {
    title: "Autofill Everything",
    copy: "Speed through forms with accurate, pre-verified data.",
    bullets: ["Context-aware autofill", "Privacy-safe by default", "Multi-device sync"],
    image: "/images/step-3.png",
    bgColor: "#f0fdf4",
  },
  {
    title: "Auditable by Design",
    copy: "See exactly what happened, when, and why—without digging.",
    bullets: ["Immutable trails", "Clear ownership", "Compliance ready"],
    image: "/images/step-4.png",
    bgColor: "#fef7ed",
  },
  {
    title: "Built for Teams",
    copy: "Roll out trust primitives org-wide with zero friction.",
    bullets: ["Org policies", "Team provisioning", "Analytics that matter"],
    image: "/images/step-5.png",
    bgColor: "#fdf2f8",
  },
];

gsap.registerPlugin(ScrollTrigger);

const StickyScrollSection = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const getTop = () =>
        containerRef.current
          ? containerRef.current.getBoundingClientRect().top + window.scrollY
          : 0;

      steps.forEach((_, i) => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: () => getTop() + i * window.innerHeight,
          end: () => getTop() + (i + 1) * window.innerHeight,
          onEnter: () => setActiveStep(i),
          onEnterBack: () => setActiveStep(i),
          invalidateOnRefresh: true,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative w-full bg-white" style={{ height: "500vh" }}>
      <div className="sticky top-0 h-screen grid md:grid-cols-2 gap-8 md:gap-14 items-center px-6 md:px-12">
        <div className="relative h-[340px] md:h-[380px]">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className={`absolute inset-0 flex flex-col justify-center space-y-4 rounded-2xl p-6 bg-white/80 backdrop-blur shadow-sm transition-all duration-500 ${
                activeStep === idx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
            >
              <div className="text-sm text-slate-400 uppercase tracking-[0.18em]">
                Step {idx + 1}
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900">{step.title}</h3>
              <p className="text-lg text-slate-600">{step.copy}</p>
              <ul className="space-y-3 text-slate-600">
                {step.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 items-start">
                    <span className="h-2 w-2 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative h-[520px] md:h-[800px]">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                activeStep === idx ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.08),transparent),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.08),transparent)]" />
                <div className="relative flex flex-col items-center justify-center gap-3 text-center">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Image {idx + 1}
                  </div>
                  <div className="text-2xl font-semibold text-slate-700">{step.title}</div>
                  <div className="text-sm text-slate-500 max-w-md">{step.copy}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StickyScrollSection;
