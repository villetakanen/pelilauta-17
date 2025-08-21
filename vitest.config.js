import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Include test files, test fot the test files, spec for playwright e2e tests
    include: ['**/*.test.ts'],
  },
});
