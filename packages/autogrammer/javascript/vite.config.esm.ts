import config from './vite.config.js';
import { mergeConfig, } from 'vitest/config';
// import dts from 'vite-plugin-dts';

export default mergeConfig(config, {
  build: {
    emptyOutDir: false,
    outDir: './dist/esm',
    lib: {
      entry: 'src/index.ts',
      formats: ['es',],
      fileName: 'index',
      name: 'Autogrammer',
    },
    sourcemap: true,
    target: 'esnext',
    minify: false,
  },
  // plugins: [dts({ rollupTypes: true, }),],
});
