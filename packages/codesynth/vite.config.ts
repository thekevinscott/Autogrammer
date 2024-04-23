import { defineConfig, } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'umd',],
      fileName: 'index',
      name: 'CodeSynth',
    },
  },
  plugins: [dts(),],
  test: {
    coverage: {
      provider: 'v8', // or 'v8'
    },
    include: ['**/*.test.ts',],
    globals: true,
    // ts
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
