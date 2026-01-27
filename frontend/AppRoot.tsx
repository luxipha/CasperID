import React from 'react';
import { QueryProvider } from './contexts/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { WalletConnectProvider } from './contexts/WalletConnectProvider';
import { CasperProvider } from './contexts/casper-context';
import App from './App';

/**
 * Root App component with providers
 * Wraps the main App with authentication, React Query, and WalletConnect providers
 */
const AppRoot: React.FC = () => {
  return (
    <CasperProvider>
      <WalletConnectProvider>
        <QueryProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryProvider>
      </WalletConnectProvider>
    </CasperProvider>
  );
};

export default AppRoot;