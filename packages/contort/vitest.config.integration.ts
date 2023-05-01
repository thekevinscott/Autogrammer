import { defineConfig, } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    testTimeout: 20000,
    hookTimeout: 60000,
    include: [
      'integration-tests/**/*.test.ts',
    ],
    exclude: [
      'src/**/*.ts',
    ],
    watchExclude: [
      'tmp/**/*',
    ],
    globals: true,
    typecheck: {
      tsconfig: './integration-tests/tsconfig.json',
    },
    setupFiles: [
      path.resolve(__dirname, './integration-tests/setup/index.ts'),
    ],
  },
});
