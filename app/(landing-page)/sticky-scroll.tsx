"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const steps = [
  {
    title: "Verify once",
    copy: "You complete identity verification a single time — no more re-uploading documents on every new platform..",
    bullets: [],
    image: "/images/1.webp",
    bgColor: "#f1f5f9",
  },
  {
    title: "Stop repeating face scans",
    copy: "Your liveness check can be reused and revalidated when needed, without turning on your camera over and over again.",
    bullets: [],
    image: "/images/2.webp",
    bgColor: "#e0f2fe",
  },
  {
    title: "Have a verified identity profile",
    copy: "You get a single, reusable profile that shows your verified details and credentials — without becoming a social network.",
    bullets: [],
    image: "/images/3.webp",
    bgColor: "#f0fdf4",
  },
  {
    title: "Log in - log out cleanly",
    copy: "Sign in anywhere with one tap, like “Login with Google,”, control what you share, revoke access anytime and take your identity with you.",
    bullets: [""],
    image: "/images/4.webp",
    bgColor: "#fef7ed",
  },
  {
    title: "Fill forms instantly",
    copy: "Fill forms are automatically with verified information — only with your approval.",
    bullets: [""],
    image: "/images/5.webp",
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
              className={`absolute inset-0 flex flex-col justify-center space-y-4 rounded-2xl p-6 bg-white/80 backdrop-blur shadow-sm transition-all duration-500 ${activeStep === idx ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
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
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${activeStep === idx ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 relative flex items-center justify-center">

                {/* Blurred Background Layer */}
                <div className="absolute inset-0">
                  <Image
                    src={step.image}
                    alt=""
                    fill
                    className="object-cover opacity-50 blur-2xl scale-110"
                    priority={idx === 0}
                  />
                </div>

                {/* Sharp Foreground Layer */}
                <div className="relative w-full h-full z-10 p-4 md:p-8">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority={idx === 0}
                  />
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
