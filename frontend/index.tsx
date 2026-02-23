
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoot from './AppRoot';
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
    <AppRoot />
  </React.StrictMode>
);
