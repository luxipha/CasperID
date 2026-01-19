
import React from 'react';
import { Quote } from 'lucide-react';

export const TestimonialSection: React.FC = () => {
  const authorImg = "https://lh3.googleusercontent.com/aida-public/AB6AXuA9svp2AT_q3TUjFfrvsWAISnmYMNbtilnGMFgOXG8NBWcq-DB9M1satXjhEDGcDBF3eJ7ZicN5MUZsmkPlG0uig0NIJy5SBudKAjUPHmHwLObhvyk0CiBdsd0-A6tE3W5WnrI9emo0M41BUDSxugOSDRmCFrgJcjrLJBstAfKkrffsxmRdd0cuaGnSZFAGhR7cTek1viAEQgEQe-BotnFi5AIAtwca-lseKj2aAW9TtovfYhA6crdlwBND_ml7yQO95PIv9xLxWfg";

  return (
    <section className="py-32 bg-forest-dark text-white">
      <div className="max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
        <div className="mb-12">
          <Quote className="text-primary w-16 h-16 fill-primary opacity-50" />
        </div>
        <blockquote className="mb-16">
          <p className="font-serif-quote italic text-3xl lg:text-5xl leading-tight text-white/95">
            "Since integrating Royal Sync, the 'wait' has disappeared from our waitstaff. The orders just appear, and we can spend our energy making people feel welcome."
          </p>
        </blockquote>
        <div className="flex flex-col items-center gap-4">
          <img 
            alt="Marcus Thorne" 
            className="w-16 h-16 rounded-full object-cover border-2 border-primary/30" 
            src={authorImg}
          />
          <div>
            <p className="font-bold text-lg tracking-tight">Marcus Thorne</p>
            <p className="text-[10px] font-black text-primary tracking-[0.2em] uppercase mt-1">Founder, Hearth & Vine</p>
          </div>
        </div>
      </div>
    </section>
  );
};
