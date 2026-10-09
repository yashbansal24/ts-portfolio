import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/global.css';
import { App } from './App';
import { applyMotionAttr } from './hooks/useMotionPaused';

const root = document.getElementById('root');
if (!root) throw new Error('#root missing');

// Stored "Pause motion" choice → html[data-motion] before React renders (index.html also does this pre-paint).
applyMotionAttr();

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production builds prerender the page into #root (vite.config.ts) → hydrate it; the dev server serves an empty #root.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
