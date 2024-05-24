import { defineConfig, } from 'vitest/config';
import { externalizeDeps, } from 'vite-plugin-externalize-deps';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    emptyOutDir: false,
  },
  plugins: [
    externalizeDeps({
      except: [
        'playground-elements',
      ],
    }),
    // dts(),
  ],
  // // test: {
  // //   coverage: {
  // //     provider: 'v8',
  // //   },
  // //   include: ['**/*.test.ts',],
  // //   globals: true,
  // //   typecheck: {
  // //     tsconfig: './tsconfig.test.json',
  // //   },
  // // },
});

