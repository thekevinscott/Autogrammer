import config from './vite.config.js';
import { mergeConfig, } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default mergeConfig(config, {
  build: {
    // emptyOutDir: false,
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
      fileName: (_format, entryName) => {
        return `${entryName}.js`;
      },
    },
    rollupOptions: {
      input: {
        index: 'src/index.ts',
        'builder-v1/index': 'src/builder-v1/index.ts',
        'builder-v2/index': 'src/builder-v2/index.ts',
      },
    },
    sourcemap: true,
    target: 'esnext',
    // minify: true,
  },
  plugins: [dts({ rollupTypes: false, }),],
});

// export default mergeConfig(config, {
//   build: {
//     // lib: {
//     //   entry: 'src/index.ts',
//     //   formats: ['es'],
//     //   fileName: 'index',
//     // },
//     lib: {
//       formats: ['es'],
//       entry: 'src/index.ts',
//       fileName: (_format, entryName) => `${entryName}.index.js`,
//     },
//     rollupOptions: {
//       input: {
//         index: 'src/index.ts',
//         // 'builder/index': 'src/builder/index.ts',
//       },
//     },
//     sourcemap: true,
//     target: 'esnext',
//     // minify: true,
//   },
//   plugins: [dts({ rollupTypes: true, }),],
// });
