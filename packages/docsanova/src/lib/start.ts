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
} = pkg;
import os from 'os';

export interface StartOpts extends Opts {
  port: number;
}

import path from 'path';
import * as url from 'url';
import { TSWatcher, } from './utils/rollup.js';
import { Opts, } from './types.js';
import { getCreateFile, } from './utils/get-create-file.js';
import { getPromise, } from './utils/get-promise.js';
import { isExcluded, } from './utils/is-excluded.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const ROOT = path.resolve(__dirname, "../../");
const CONTENT = path.resolve(ROOT, "content");
const JS = path.resolve(ROOT, "js");

export const start = async ({
  port,
  input: inputDir,
  contentDir,
  srcDir,
}: StartOpts) => {
  if (!inputDir) {
    throw new Error('No input specified');
  }
  // const tmpInput = path.resolve(ROOT, 'tmp/input');
  // const tmpOutput = path.resolve(ROOT, 'tmp/output');
  const tmpInput = path.resolve(os.tmpdir(), 'input', Math.random().toString(36));
  const tmpOutput = path.resolve(os.tmpdir(), 'output', Math.random().toString(36));
  const createFile = getCreateFile(inputDir);
  await Promise.all([
    mkdirp(tmpInput),
    mkdirp(tmpOutput),
  ]);

  // For monitoring individual files
  const [ready, readyCallback,] = getPromise();
  let written = 0;
  [
    {
      input: path.resolve(inputDir, 'docsanova.json'),
      output: path.resolve(tmpInput, '_data/docsanova.json'),
    },
    {
      input: path.resolve(ROOT, 'eleventy.config.cjs.mustache'),
      output: path.resolve(tmpInput, 'eleventy.config.cjs'),
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
          tmpInput,
          tmpOutput,
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
      output: tmpInput,
    },
    {
      input: path.resolve(inputDir, srcDir, 'pages'),
      output: tmpInput,
      transform: (content: string) => `
{% extends "layouts/base.html" %} 
{% block content %}
${content}
{% endblock %}
`,
    },
    {
      input: path.resolve(ROOT, CONTENT),
      output: tmpInput,
    },
    {
      input: path.resolve(ROOT, JS),
      output: path.resolve(tmpInput, '_internal_js'),
    },
    {
      input: path.resolve(inputDir, srcDir, 'styles'),
      output: path.resolve(tmpInput, 'styles'),
    },
    {
      input: path.resolve(inputDir, '.js'),
      output: path.resolve(tmpInput, '.js'),
    },
  ].forEach(({ input, output, transform, }) => {
    chokidar.watch(input).on('all', (event, inputFilepath) => {
      if (!isExcluded(inputFilepath)) {
        // console.log('event', event, inputFilepath);
        if (event === 'add' || event === 'change') {
          const filepath = inputFilepath.split(`${input}/`)[1];
          const outputFilepath = path.resolve(tmpInput, output, filepath);
          // console.log('event', event, inputFilepath, outputFilepath);
          void createFile(inputFilepath, outputFilepath, transform);
        } else if (event === 'unlink') {
          const filepath = inputFilepath.split(`${input}/`)[1];
          const outputFilepath = path.resolve(tmpInput, output, filepath);
          void unlink(outputFilepath);
        } else if (!['addDir',].includes(event)) {
          console.log(event, path);
        }
      }
    });
  });


  new TSWatcher(inputDir);

  await ready;
  const elev = new Eleventy(tmpInput, tmpOutput, {
    source: "cli",
    runMode: 'serve',
    quietMode: false,
    configPath: path.resolve(tmpInput, 'eleventy.config.cjs'),
    // pathPrefix: undefined,
    // dryRun: false,

  });
  await elev.init();
  await elev.watch();
  elev.serve(port);
};

