import React from 'react';
import { QueryProvider } from './contexts/QueryProvider';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

/**
 * Root App component with providers
 * Wraps the main App with authentication and React Query providers
 */
const AppRoot: React.FC = () => {
  return (
    <QueryProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryProvider>
  );
};

export default AppRoot;