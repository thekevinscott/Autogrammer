import { defineConfig, } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'src/**/*.test.ts',
    ],
    exclude: [
      'integration-tests/**/*.test.ts',
    ],
    watchExclude: [
      'tmp/**/*',
    ],
    globals: true,
  },
});
