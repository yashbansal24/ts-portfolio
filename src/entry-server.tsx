import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App';

/**
 * Build-time prerender (see the `prerender` plugin in vite.config.ts): the static markup goes into
 * dist/index.html's #root so the page paints before the JS bundle runs; main.tsx then hydrates it.
 * Must render exactly what the client's first render produces (no window/document/Date.now in render).
 */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
