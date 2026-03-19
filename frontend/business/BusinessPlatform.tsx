import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import Integrations from './pages/Integrations';
import IntegrationDetail from './pages/IntegrationDetail';
import APIManagement from './pages/APIManagement';
import Webhooks from './pages/Webhooks';
import Analytics from './pages/Analytics';
import Billing from './pages/Billing';
import Docs from './pages/Docs';
import Settings from './pages/Settings';
import SDKDesign from './pages/SDKDesign';

export const BusinessPlatform: React.FC = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/integrations/:id" element={<IntegrationDetail />} />
                <Route path="/api-management" element={<APIManagement />} />
                <Route path="/webhooks" element={<Webhooks />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/sdk-design" element={<SDKDesign />} />
                <Route path="*" element={<Navigate to="/business" replace />} />
            </Routes>
        </Layout>
    );
};

export default BusinessPlatform;
