import config from './vite.config.js';
import { mergeConfig, } from 'vitest/config';
// import dts from 'vite-plugin-dts';

export default mergeConfig(config, {
  build: {
    emptyOutDir: false,
    lib: {
      formats: ['es'],
      entry: 'src/umd.ts',
      fileName: (_format, entryName) => `${entryName}.umd.cjs`,
      name: 'GBNF',
    },
    rollupOptions: {
      input: {
        index: 'src/umd.ts',
        'builder-v1/index': 'src/builder-v1/index.ts',
        'builder-v2/index': 'src/builder-v2/index.ts',
      },
    },
    sourcemap: true,
    target: 'esnext',
    minify: true,
  },
  // plugins: [dts({ rollupTypes: true, }),],
});
