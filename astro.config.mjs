import path from 'node:path';
import { fileURLToPath } from 'node:url';
import netlify from '@astrojs/netlify';
import svelte from '@astrojs/svelte';
import { defineConfig } from 'astro/config';
import { visualizer } from 'rollup-plugin-visualizer';
import tsconfigPaths from 'vite-tsconfig-paths';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],

  output: 'server',

  vite: {
    resolve: {
      alias: [
        {
          find: '@cyan-svelte',
          replacement: path.resolve(__dirname, 'packages/cyan-svelte/src'),
        },
      ],
    },
    plugins: [
      tsconfigPaths(),
      visualizer({
        emitFile: true,
        filename: 'stats.html',
      }),
    ],
    optimizeDeps: {
      include: ['nanostores', '@nanostores/persistent', 'zod'],
      exclude: [
        'firebase/firestore',
        'firebase/auth',
        'firebase/storage',
        'firebase/app',
      ],
    },
    ssr: {
      noExternal: ['nanostores', '@nanostores/persistent'],
    },
  },

  adapter: netlify({
    edgeMiddleware: false,
  }),
});
