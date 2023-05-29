// rollup.config.js
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
// import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import commonjs from '@rollup/plugin-commonjs';

const production = !process.env.ROLLUP_WATCH;

export default {
  input: './src/js/index.ts',
  output: {
    sourcemap: !production,
    dir: 'src/_js',
    format: 'esm'
  },
  // external: [
  //   /node_modules/],
  plugins:
    [
      // peerDepsExternal(),
      nodeResolve({
        browser: true,
      }),
      commonjs(),
      typescript(),
    ]
};

// // rollup.config.js
// export default [
// 	{
// 		input: 'main.js',
// 		output: { file: 'bundle.cjs.js', format: 'cjs' }
// 	},
// 	{
// 		input: 'main.js',
// 		watch: false,
// 		output: { file: 'bundle.es.js', format: 'es' }
// 	}
// ];