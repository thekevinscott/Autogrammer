import {
  type ModuleFormat,
  watch,
  rollup,
} from 'rollup';
import _typescript from '@rollup/plugin-typescript';
import { nodeResolve, } from '@rollup/plugin-node-resolve';
import _nodePolyfills from 'rollup-plugin-polyfill-node';
import _commonjs from '@rollup/plugin-commonjs';
import path from 'path';

const nodePolyfills = _nodePolyfills as unknown as typeof _nodePolyfills.default;
const typescript = _typescript as unknown as typeof _typescript.default;
const commonjs = _commonjs as unknown as typeof _commonjs.default;

const getOptions = (buildDir: string) => ({
  input: path.resolve(buildDir, 'src/index.ts'),
  output: [{
    sourcemap: true,
    dir: path.resolve(buildDir, '.js'),
    format: 'esm' as ModuleFormat,
  },],
  plugins: [
    nodeResolve({
      browser: true,
    }),
    nodePolyfills(),
    commonjs(),
    typescript({
      tsconfig: path.resolve(buildDir, 'tsconfig.json'),
    }),
  ],
});

export const buildRollup = (buildDir: string) => rollup(getOptions(buildDir));

export class TSWatcher {
  // watcher: ReturnType<typeof watch>;
  constructor(watchDir: string) {
    const watcher = watch({
      ...getOptions(watchDir),
      watch: {
        include: path.resolve(watchDir, 'src/**'),
      },
    });

    // This will make sure that bundles are properly closed after each run
    watcher.on('event', (event) => {
      // event.code can be one of:
      //   START        — the watcher is (re)starting
      //   BUNDLE_START — building an individual bundle
      //                  * event.input will be the input options object if present
      //                  * event.output contains an array of the "file" or
      //                    "dir" option values of the generated outputs
      //   BUNDLE_END   — finished building a bundle
      //                  * event.input will be the input options object if present
      //                  * event.output contains an array of the "file" or
      //                    "dir" option values of the generated outputs
      //                  * event.duration is the build duration in milliseconds
      //                  * event.result contains the bundle object that can be
      //                    used to generate additional outputs by calling
      //                    bundle.generate or bundle.write. This is especially
      //                    important when the watch.skipWrite option is used.
      //                  You should call "event.result.close()" once you are done
      //                  generating outputs, or if you do not generate outputs.
      //                  This will allow plugins to clean up resources via the
      //                  "closeBundle" hook.
      //   END          — finished building all bundles
      //   ERROR        — encountered an error while bundling
      //                  * event.error contains the error that was thrown
      //                  * event.result is null for build errors and contains the
      //                    bundle object for output generation errors. As with
      //                    "BUNDLE_END", you should call "event.result.close()" if
      //                    present once you are done.
      // If you return a Promise from your event handler, Rollup will wait until the
      // Promise is resolved before continuing.
      if (event.code === 'BUNDLE_END') {
        const { result, } = event;
        if (result) {
          return result.close();
        } else {

          // console.log("event", event);
        }
      } else if (event.code === 'ERROR') {
        console.error(event);
      } else {

        // console.log("event", event);
      }
    });

    // // Additionally, you can hook into the following. Again, return a Promise to
    // // make Rollup wait at that stage:
    // watcher.on('change', (id, { event, }) => {
    //   /* a file was modified */
    // });
    // watcher.on('restart', () => {
    //   /* a new run was triggered */
    // });
    // watcher.on('close', () => {
    //   /* the watcher was closed, see below */
    // });

    // // to stop watching
    // watcher.close();

  }
}

// export class TSBundler {
//   pending = false;
//   bundling = false;

//   bundle = async (rootTSDir: string): Promise<void> => {
//     console.log('****', rootTSDir);
//     if (this.bundling) {
//       this.pending = true;
//     } else {
//       this.bundling = true;
//       // const tsconfig = await writeTSConfig(rootTSDir);

//       const bundle = await rollup({
//         input: path.resolve(rootTSDir, 'src/index.ts'),
//         plugins: [
//           nodeResolve({
//             browser: true,
//           }),
//           commonjs(),
//           typescript({
//             tsconfig,
//           }),
//         ],
//       });
//       const { output, } = await bundle.generate({
//         sourcemap: true,
//         dir: path.resolve(rootTSDir, './dist'),
//         format: 'esm',
//       });
//       const isAsset = (output: OutputChunk | OutputAsset): output is OutputAsset => {
//         return output.type === 'asset';
//       };
//       await Promise.all(output.map(async (output) => {
//         const outputPathName = path.resolve(rootTSDir, 'dist', output.fileName);
//         console.log('output', outputPathName);
//         if (isAsset(output)) {
//           if (typeof output.source !== 'string') {
//             throw new Error('Expected string');
//           }
//           await writeFile(outputPathName, output.source);
//         } else {
//           await writeFile(outputPathName, output.code);
//           // console.log(output);
//         }
//       }));
//       // console.log('all done!', output);
//       this.bundling = false;

//       if (this.pending) {
//         this.pending = false;
//         return this.bundle(rootTSDir);
//       }
//     }
//   };

// }

// // const writeTSConfig = async (root: string): Promise<string> => {
// //   const tsconfigFilePath = path.resolve(root, 'tsconfig.json');
// //   await writeFile(tsconfigFilePath, JSON.stringify({
// //     "compilerOptions": {
// //       "strict": true,
// //       "noImplicitAny": true,
// //       "removeComments": true,
// //       "preserveConstEnums": true,
// //       "module": "nodenext",
// //       "target": "esnext",
// //       "experimentalDecorators": true,
// //       "moduleResolution": "NodeNext",
// //       "sourceMap": true,
// //       "skipLibCheck": true,
// //       "declaration": true,
// //       "rootDir": path.resolve(root, './src'),
// //       "outDir": path.resolve(root, './dist'),
// //     },
// //     "include": [
// //       path.resolve(root, './src/**/*.ts'),
// //     ],
// //     "exclude": [
// //       "node_modules",
// //       ".vscode-test",
// //       "dist",
// //       ".wireit",
// //       "env",
// //       path.resolve(root, './src/**/*.test.ts'),
// //     ],
// //   }, null, 2));
// //   return tsconfigFilePath;
// // };
