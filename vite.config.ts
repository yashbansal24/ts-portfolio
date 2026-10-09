import { createServer, defineConfig, type Plugin, type ResolvedConfig } from 'vite';
import react from '@vitejs/plugin-react';

const built = new Date();
/** Shared compile-time constants (typed in src/vite-env.d.ts). */
const define = {
  __BUILD_MONTH__: JSON.stringify(built.getFullYear() * 12 + built.getMonth()),
};

/**
 * Prerender: render <App/> to static HTML at build time (src/entry-server.tsx, through a throwaway Vite SSR
 * server) and inline it into index.html's #root, so content and the LCP heading paint before the JS bundle
 * has downloaded. main.tsx hydrates the markup. No extra build step or output folder.
 */
function prerender(): Plugin {
  let config: ResolvedConfig;
  return {
    name: 'portfolio:prerender',
    apply: 'build',
    configResolved(c) {
      config = c;
    },
    transformIndexHtml: {
      order: 'post',
      async handler(html) {
        if (config.build.ssr) return html;
        const marker = '<div id="root"></div>';
        if (!html.includes(marker)) throw new Error(`[prerender] ${marker} not found in index.html`);
        const server = await createServer({
          configFile: false,
          root: config.root,
          logLevel: 'error',
          appType: 'custom',
          server: { middlewareMode: true, hmr: false, ws: false },
          cacheDir: 'node_modules/.vite-prerender',
          optimizeDeps: { noDiscovery: true, include: [] },
          plugins: [react()],
          define,
        });
        try {
          const mod = (await server.ssrLoadModule('/src/entry-server.tsx')) as { render: () => string };
          const app = mod.render();
          return html.replace(marker, () => `<div id="root">${app}</div>`);
        } catch (err) {
          // fail soft: ship the empty #root (main.tsx then client-renders, exactly as before) but say so loudly
          config.logger.warn(`\n[prerender] skipped, shipping a client-rendered page: ${(err as Error)?.stack ?? err}\n`);
          return html;
        } finally {
          await server.close();
        }
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), prerender()],
  define,
  build: {
    outDir: 'dist',
    sourcemap: false,
    // three.js lives in lazily-loaded scene chunks (~540 kB min, ~140 kB gzip); the main bundle stays lean.
    chunkSizeWarningLimit: 700,
  },
});
