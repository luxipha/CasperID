
import React, { useState, useEffect } from 'react';
import ExtensionContainer from './components/ExtensionContainer';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import PermissionRequestScreen from './components/PermissionRequestScreen';
import { ScreenState } from './types';
import { getStorageData } from './services/storageService';

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>('welcome');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { connected } = await getStorageData();

      // Check for pending requests from background
      const result = await new Promise<any>((resolve) => {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get(['pendingRequest'], resolve);
        } else {
          resolve({});
        }
      });

      if (result?.pendingRequest) {
        setScreen('permission_request');
      } else if (connected) {
        setScreen('dashboard');
      }

      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onGetStarted={() => setScreen('login')}
            onLogin={() => setScreen('login')}
          />
        );
      case 'login':
        return <LoginScreen onSuccess={() => setScreen('dashboard')} />;
      case 'permission_request':
        return (
          <PermissionRequestScreen
            onAllow={() => setScreen('dashboard')}
            onDeny={() => setScreen('dashboard')}
          />
        );
      case 'dashboard':
        return <DashboardScreen onShare={() => setScreen('permission_request')} />;
      default:
        return <WelcomeScreen onGetStarted={() => setScreen('login')} onLogin={() => setScreen('login')} />;
    }
  };

  const showBack = screen === 'login';

  return (
    <ExtensionContainer
      showBack={showBack}
      onBack={() => setScreen('welcome')}
      headerTitle="CasperID Connect"
      headerSub="Your verified identity on the blockchain"
    >
      {renderScreen()}
    </ExtensionContainer>
  );
};

export default App;
