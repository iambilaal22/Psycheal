import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely handle and ignore expected/benign WebSocket and HMR connection issues to prevent unhandled rejection overlays
if (typeof window !== 'undefined') {
  const isWebsocketError = (errStr: string) => {
    return (
      errStr.includes('WebSocket') ||
      errStr.includes('websocket') ||
      errStr.includes('WebSocket connection') ||
      errStr.includes('closed without opened') ||
      errStr.includes('vite')
    );
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    if (reason) {
      const msg = reason.message || String(reason);
      if (isWebsocketError(msg)) {
        event.stopImmediatePropagation();
        event.preventDefault();
        console.debug('Caught and ignored benign WebSocket rejection:', msg);
      }
    }
  }, { capture: true });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (isWebsocketError(msg)) {
      event.stopImmediatePropagation();
      event.preventDefault();
      console.debug('Caught and ignored benign WebSocket error:', msg);
    }
  }, { capture: true });
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
