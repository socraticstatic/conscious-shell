import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { installLogger } from './lib/logger';
import { __BIRTH__ } from './lib/void';

installLogger();
__BIRTH__();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
