
import React, { useState } from 'react';
import { Hero } from './casperos/Hero';
import { QuoteSection } from './casperos/QuoteSection';
import { StatsSection } from './casperos/StatsSection';
import { BrandLogos } from './casperos/BrandLogos';
import { FeatureGrid } from './casperos/FeatureGrid';
import { IntegrationHub } from './casperos/IntegrationHub';
import { DashboardSection } from './casperos/DashboardSection';
import { ZaloIntegration } from './casperos/ZaloIntegration';
import { CTASection } from './casperos/CTASection';
import { TestimonialSection } from './casperos/TestimonialSection';
import { PricingSection } from './casperos/PricingSection';
import { ScrollToTop } from './casperos/ScrollToTop';
import { DashboardView } from './casperos/DashboardView';
import { DemoModal } from './casperos/DemoModal';

export const AdevarOSFlow: React.FC = () => {
    const [showDashboard, setShowDashboard] = useState(false);
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

    const handleDemoRequest = () => {
        setIsDemoModalOpen(true);
    };

    const handleDemoComplete = () => {
        setIsDemoModalOpen(false);
        setShowDashboard(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (showDashboard) {
        return <DashboardView onExit={() => setShowDashboard(false)} />;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-midnight dark:text-white transition-colors duration-300">
            <Hero onCtaClick={handleDemoRequest} />
            <QuoteSection />
            <StatsSection />
            <BrandLogos />
            <FeatureGrid />
            <IntegrationHub />
            <DashboardSection onDemoClick={handleDemoRequest} />
            <ZaloIntegration />
            <PricingSection onCtaClick={handleDemoRequest} />
            <CTASection onDemoClick={handleDemoRequest} />
            <TestimonialSection />


            <DemoModal
                isOpen={isDemoModalOpen}
                onClose={() => setIsDemoModalOpen(false)}
                onComplete={handleDemoComplete}
            />
        </div>
    );
};
