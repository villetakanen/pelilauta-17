import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './cn-lightbox/vitest.config.ts',
  './vitest.config.js',
  './cn-lightbox/src/vite.config.ts',
  './cn-editor/vite.config.ts',
  './cn-dice/vite.config.ts',
]);
