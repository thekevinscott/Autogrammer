import Mustache from 'mustache';
import {
  Eleventy,
} from "@11ty/eleventy";
import chokidar from 'chokidar';
import pkg from 'fs-extra';
const {
  existsSync,
  mkdirp,
  unlink,
  // realpath,
  // symlink,
  copy,
} = pkg;
import os from 'os';

export interface StartOpts extends Opts {
  port: number;
  buildDir: string;
  internalDir: string;
}

import path from 'path';
import * as url from 'url';
// import { RollupWatcher, } from './utils/rollup.js';
import { Opts, } from './types.js';
import { getCreateFile, } from './utils/get-create-file.js';
import { getPromise, } from './utils/get-promise.js';
import { isExcluded, } from './utils/is-excluded.js';
import { TSCWatcher, } from './utils/tsc.js';
// import {
//   symlinkNodeModules,
// } from './utils/symlink-node-modules.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const DOCSANOVA_ROOT = path.resolve(__dirname, "../../");
const CONTENT = path.resolve(DOCSANOVA_ROOT, "content");
const INTERNAL_JS_FOLDER = path.resolve(DOCSANOVA_ROOT, "js");

// const rand = Math.random().toString(36);
export const start = async ({
  port,
  input: inputDir,
  contentDir,
  srcDir,
  buildDir,
  internalDir,
  // nodeModulesDir = '_nm',
}: StartOpts) => {
  if (!inputDir) {
    throw new Error('No input specified');
  }
  // const tmpInput = path.resolve(tmpRoot, 'input');
  const createFile = getCreateFile(inputDir);
  await Promise.all([
    // mkdirp(tmpInput),
    mkdirp(buildDir),
    mkdirp(internalDir),
  ]);

  // For monitoring individual files
  const [ready, readyCallback,] = getPromise();
  let written = 0;
  [
    {
      input: path.join(inputDir, 'docsanova.json'),
      output: path.join(internalDir, '_data/docsanova.json'),
    },
    {
      input: path.join(DOCSANOVA_ROOT, 'eleventy.config.cjs.mustache'),
      output: path.join(internalDir, 'eleventy.config.cjs'),
    },
  ].forEach(({ input, output, }) => {
    if (!(existsSync(input))) {
      throw new Error(`File ${input} does not exist`);
    }
    chokidar.watch(input).on('all', (
      event,
      // inputFilepath,
    ) => {
      // console.log('event', event, input);
      if (event === 'add' || event === 'change') {
        written += 1;
        if (written >= 2) {
          readyCallback();
        }
        void createFile(input, output, contents => Mustache.render(contents, {
          USER_STYLES_FOLDER: path.join(internalDir, 'styles'),
          USER_JS_FOLDER: path.join(internalDir, 'js'),
          INTERNAL_JS_FOLDER: path.join(internalDir, '_internal_js'),
        }));
      } else if (!['addDir',].includes(event)) {
        console.log(event, path);
      }
    });
  });

  // For monitoring directories
  [
    {
      input: path.resolve(inputDir, contentDir),
      output: path.resolve(internalDir),
    },
    {
      input: path.resolve(inputDir, srcDir, 'pages'),
      output: path.resolve(internalDir),
      transform: (content: string) => `
    {% extends "layouts/base.html" %} 
    {% block content %}
    ${content}
    {% endblock %}
    `,
    },
    {
      input: path.resolve(DOCSANOVA_ROOT, CONTENT),
      output: path.resolve(internalDir),
    },
    {
      input: path.resolve(DOCSANOVA_ROOT, INTERNAL_JS_FOLDER),
      output: path.resolve(internalDir, '_internal_js'),
    },
    {
      input: path.resolve(inputDir, srcDir, 'styles'),
      output: path.resolve(internalDir, 'styles'),
    },
    // {
    //   input: path.resolve(inputDir, '.docsanova/js'),
    //   output: path.resolve(tmpInput, 'js'),
    // },
  ].forEach(({ input, output, transform, }: { input: string; output: string; transform?: (content: string) => string; }) => {
    chokidar.watch(input, {
      ignorePermissionErrors: false,
    }).on('all', (event, inputFilepath) => {
      if (!isExcluded(inputFilepath)) {
        if (event === 'add' || event === 'change') {
          const filepath = inputFilepath.split(`${input}/`)[1];
          const outputFilepath = path.resolve(internalDir, output, filepath);
          void createFile(inputFilepath, outputFilepath, transform);
        } else if (event === 'unlink') {
          const filepath = inputFilepath.split(`${input}/`)[1];
          const outputFilepath = path.resolve(internalDir, output, filepath);
          void unlink(outputFilepath);
        } else if (!['addDir',].includes(event)) {
          console.log(event, path);
        }
      }
    });
  });



  new TSCWatcher(inputDir);

  await ready;
  const elev = new Eleventy(internalDir, buildDir, {
    source: "cli",
    runMode: 'serve',
    quietMode: false,
    configPath: path.resolve(internalDir, 'eleventy.config.cjs'),
    // pathPrefix: undefined,
    // dryRun: false,

  });
  await elev.init();
  await elev.watch();
  elev.serve(port);
};

