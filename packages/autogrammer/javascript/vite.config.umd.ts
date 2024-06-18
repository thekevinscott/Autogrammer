import config from './vite.config.js';
import { mergeConfig, } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default mergeConfig(config, {
  build: {
    emptyOutDir: false,
    outDir: './dist/umd',
    lib: {
      entry: 'src/index.ts',
      formats: ['umd',],
      fileName: 'index',
      name: 'Autogrammer',
    },
    sourcemap: true,
    target: 'esnext',
    minify: true,
  },
  plugins: [dts({ rollupTypes: true, }),],
});
