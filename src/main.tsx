import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { installLogger } from './lib/logger';
import { __BIRTH__, __HAUNT__ } from './lib/void';

installLogger();
__BIRTH__();

// The interactive layer waits until the page is quiet, then starts listening.
{
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback;
  if (typeof ric === 'function') ric(() => __HAUNT__(), { timeout: 3000 });
  else setTimeout(() => __HAUNT__(), 1800);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
