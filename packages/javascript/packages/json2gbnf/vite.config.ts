import { defineConfig, } from 'vitest/config';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/umd.ts',
      formats: ['umd',],
      fileName: 'index',
      name: 'GBNF',
    },
    sourcemap: true,
    target: 'esnext',
    minify: true,
  },
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**']
    },
    include: ['./src/**/*.test.ts', './test/**/*.test.ts',],
    exclude: ['./dev/**/*',],
    globals: true,
    // ts
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
    setupFiles: [
      path.resolve(__dirname, './test/setup/index.ts'),
    ],
  },
});
