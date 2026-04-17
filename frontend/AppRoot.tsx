import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { WalletConnectProvider } from './contexts/WalletConnectProvider';
import { CasperProvider } from './contexts/casper-context';
import App from './App';
import LandingPage from './components/landing/LandingPage';

/**
 * External redirect component - Navigate doesn't work for external URLs
 */
const ExternalRedirect: React.FC<{ to: string }> = ({ to }) => {
  window.location.href = to;
  return null;
};


/**
 * Component that wraps the app with authenticated providers
 */
const AuthenticatedProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CasperProvider>
      <WalletConnectProvider>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </WalletConnectProvider>
    </CasperProvider>
  );
};

/**
 * Root App component with providers
 * Separates public routes from authenticated/app routes to optimize loading
 */
const AppRoot: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - No Providers Needed */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/anra" element={<ExternalRedirect to="https://www.anra.rest" />} />
        <Route path="/adevaros" element={<ExternalRedirect to="https://www.anra.rest" />} />
        <Route path="/casperos" element={<ExternalRedirect to="https://www.anra.rest" />} />
        <Route path="/changelog" element={<ExternalRedirect to="https://www.anra.rest/changelog" />} />

        {/* Authenticated/App Routes - Wrapped in Providers */}
        <Route path="*" element={
          <AuthenticatedProviders>
            <App />
          </AuthenticatedProviders>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoot;