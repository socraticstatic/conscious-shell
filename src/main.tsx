import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { installLogger } from './lib/logger';
import { __BIRTH__, __HAUNT__ } from './lib/void';

installLogger();
__BIRTH__();

// Client-side routes (added alongside the case-study pages) mean the browser's
// automatic scroll restoration on navigation can fight with our own hash
// scrolling (useScrollToHash) and the body-height sync in App.tsx. Take
// explicit control instead of leaving it to browser default behavior.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

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
