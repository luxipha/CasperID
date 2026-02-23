
import React from 'react';

export const QuoteSection: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-background-dark" style={{ backgroundColor: '#ececfd' }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <blockquote className="mb-12">
          <p className="font-serif-quote italic text-3xl lg:text-5xl leading-tight text-primary">
            "Technology shouldn't interrupt the meal; it should facilitate the magic that happens around the table."
          </p>
        </blockquote>
        <div className="w-16 h-px bg-primary/30 mx-auto mb-12"></div>
        <p className="text-lg lg:text-xl text-charcoal dark:text-gray-400 leading-relaxed font-medium">
          In the modern dining landscape, the friction between a mobile order and the restaurant’s legacy POS system often leaves guests feeling like data points rather than diners. We built anra to fix that.
        </p>
      </div>
    </section>
  );
};
