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
  const leftSideRef = useRef<HTMLDivElement | null>(null);
  const rightSideRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isInSection, setIsInSection] = useState(false);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Create ScrollTrigger for the entire section - only when section is actually visible
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => setIsInSection(true),
        onLeave: () => setIsInSection(false),
        onEnterBack: () => setIsInSection(true),
        onLeaveBack: () => setIsInSection(false),
      });

      // Create ScrollTriggers for each section - smooth progressive transitions
      steps.forEach((step, i) => {
        ScrollTrigger.create({
          trigger: `.trigger-section-${i}`,
          start: "top center",
          end: "bottom center", 
          onEnter: () => {
            setActiveStep(i);
            // Smooth background color change
            gsap.to(leftSideRef.current, {
              backgroundColor: step.bgColor,
              duration: 0.6,
              ease: "none",
              overwrite: true,
            });
          },
          onEnterBack: () => {
            setActiveStep(i);
            gsap.to(leftSideRef.current, {
              backgroundColor: step.bgColor,
              duration: 0.6,
              ease: "none",
              overwrite: true,
            });
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative py-24">
      {isInSection && (
        <div className="fixed inset-0 z-30 pointer-events-none bg-gradient-to-br from-white via-slate-50 to-white" />
      )}
      {/* Fixed Left Side - Text Content */}
      {isInSection && (
        <div 
          ref={leftSideRef}
          className="fixed left-0 top-0 w-1/2 h-screen z-40 flex items-center justify-center p-8 pointer-events-none"
          style={{ backgroundColor: steps[0].bgColor }}
        >
        <div className="max-w-lg space-y-6">
          <div className="text-sm text-slate-400 uppercase tracking-[0.18em]">
            Step {activeStep + 1}
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
            {steps[activeStep].title}
          </h3>
          <p className="text-lg text-slate-600">
            {steps[activeStep].copy}
          </p>
          <ul className="space-y-3 text-slate-600">
            {steps[activeStep].bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 items-start">
                <span className="h-2 w-2 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
        </div>
      )}

      {/* Fixed Right Side - Image Placeholder */}
      {isInSection && (
        <div 
          ref={rightSideRef}
          className="fixed right-0 top-0 w-1/2 h-screen z-40 flex items-center justify-center p-8 pointer-events-none"
          style={{ opacity: 1 }}
        >
        <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Image {activeStep + 1}
            </div>
            <div className="text-2xl font-semibold text-slate-700">
              {steps[activeStep].title}
            </div>
            <div className="text-sm text-slate-500 max-w-md">
              {steps[activeStep].copy}
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Scrollable Trigger Sections - Behind fixed content */}
      <div className="ml-[50%] w-1/2 relative z-0">
        {steps.map((_, i) => (
          <section
            key={i}
            className={`trigger-section-${i} h-screen`}
            style={{ backgroundColor: 'transparent' }}
          >
            {/* Invisible trigger area */}
          </section>
        ))}
      </div>
    </section>
  );
};

export default StickyScrollSection;
