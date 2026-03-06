
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoot from './AppRoot';
import ErrorBoundary from './components/ErrorBoundary';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker
registerSW({ immediate: true });

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppRoot />
    </ErrorBoundary>
  </React.StrictMode>
);
