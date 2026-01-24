import React from 'react';
import { QueryProvider } from './contexts/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import { WalletConnectProvider } from './contexts/WalletConnectProvider';
import App from './App';

/**
 * Root App component with providers
 * Wraps the main App with authentication, React Query, and WalletConnect providers
 */
const AppRoot: React.FC = () => {
  return (
    <WalletConnectProvider>
      <QueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryProvider>
    </WalletConnectProvider>
  );
};

export default AppRoot;