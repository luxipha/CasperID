import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { WalletConnectProvider } from './contexts/WalletConnectProvider';
import { CasperProvider } from './contexts/casper-context';
import App from './App';
import LandingPage from './components/landing/LandingPage';
import ChangelogPage from './components/landing/casperos/changelog';

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
        <Route path="/anra" element={<LandingPage initialView="anra" />} />
        <Route path="/adevaros" element={<LandingPage initialView="anra" />} />
        <Route path="/casperos" element={<LandingPage initialView="anra" />} />
        <Route path="/changelog" element={<ChangelogPage />} />

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