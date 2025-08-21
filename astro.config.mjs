import netlify from '@astrojs/netlify';
import svelte from '@astrojs/svelte';
import sentry from '@sentry/astro';
import { defineConfig } from 'astro/config';
import { visualizer } from 'rollup-plugin-visualizer';

// https://astro.build/config
export default defineConfig({
  // Filter out null values
  integrations: [
    svelte(),
    // Conditionally include Sentry based on the NODE_ENV
    process.env.NODE_ENV === 'production'
      ? sentry({
          dsn: 'https://1fcabaabfe76dd246dea76e7e30b6ede@o4509229934968832.ingest.de.sentry.io/4509229941719120',
          tracesSampleRate: 0,
          replaysSessionSampleRate: 0,
          replaysOnErrorSampleRate: 0,
          sendDefaultPii: false,
          sourceMapsUploadOptions: {
            project: 'pelilauta',
            authToken: process.env.SENTRY_AUTH_TOKEN,
          },
        })
      : null, // Don't include Sentry in development
  ].filter(Boolean),

  output: 'server',

  vite: {
    optimizeDeps: {
      include: ['nanostores', '@nanostores/persistent'],
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
    plugins: [
      visualizer({
        emitFile: true,
        filename: 'stats.html',
      }),
    ],
  },

  adapter: netlify(),
});
