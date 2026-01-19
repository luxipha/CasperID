
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QuoteSection } from './components/QuoteSection';
import { StatsSection } from './components/StatsSection';
import { BrandLogos } from './components/BrandLogos';
import { FeatureGrid } from './components/FeatureGrid';
import { IntegrationHub } from './components/IntegrationHub';
import { DashboardSection } from './components/DashboardSection';
import { ZaloIntegration } from './components/ZaloIntegration';
import { CTASection } from './components/CTASection';
import { TestimonialSection } from './components/TestimonialSection';
import { PricingSection } from './components/PricingSection';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { DashboardView } from './components/DashboardView';
import { DemoModal } from './components/DemoModal';

const App: React.FC = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    if (showDashboard) return;

    const observerOptions = {
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [showDashboard]);

  const handleDemoComplete = () => {
    setIsDemoModalOpen(false);
    setShowDashboard(true);
  };

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-background-dark text-white font-display">
        <DashboardView onExit={() => setShowDashboard(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-all duration-500">
      <Header onDemoToggle={() => setIsDemoModalOpen(true)} />
      <main>
        <section id="home" className="reveal"><Hero onCtaClick={() => setIsDemoModalOpen(true)} /></section>
        <section className="reveal"><QuoteSection /></section>
        <section className="reveal"><StatsSection /></section>
        <BrandLogos />
        <section id="features" className="reveal"><FeatureGrid /></section>
        <section id="integration" className="reveal"><IntegrationHub /></section>
        <section id="analytics" className="reveal"><DashboardSection onDemoClick={() => setIsDemoModalOpen(true)} /></section>
        <section id="zalo" className="reveal"><ZaloIntegration /></section>
        <section id="pricing" className="reveal"><PricingSection onCtaClick={() => setIsDemoModalOpen(true)} /></section>
        <section className="reveal"><CTASection onDemoClick={() => setIsDemoModalOpen(true)} /></section>
        <section className="reveal"><TestimonialSection /></section>
      </main>
      <Footer />
      <ScrollToTop />
      
      <DemoModal 
        isOpen={isDemoModalOpen} 
        onClose={() => setIsDemoModalOpen(false)} 
        onComplete={handleDemoComplete}
      />
    </div>
  );
};

export default App;
