import Mustache from 'mustache';
import {
  Eleventy,
} from "@11ty/eleventy";
import pkg from 'fs-extra';
const {
  existsSync,
} = pkg;
import { glob, } from 'glob';
import os from 'os';

export interface BuildOpts extends Opts {
  output: string;
}

import path from 'path';
import * as url from 'url';
import { Opts, } from './types.js';
import { getCreateFile, } from './utils/get-create-file.js';
import { statSync, } from 'fs';
import {
  symlinkNodeModules,
} from './utils/symlink-node-modules.js';
import { buildTSC, } from './utils/tsc.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const ROOT = path.resolve(__dirname, "../../");
const CONTENT = path.resolve(ROOT, "content");
const JS = path.resolve(ROOT, "js");

export const build = async ({
  input: inputDir,
  output: buildDir,
  contentDir,
  srcDir,
  nodeModulesDir = '_nm',
}: BuildOpts) => {
  if (!inputDir) {
    throw new Error('No input specified');
  }
  if (!buildDir) {
    throw new Error('No build dir specified');
  }
  const tmpInput = path.resolve(os.tmpdir(), 'input', Math.random().toString(36));
  // const tmpInput = path.resolve(ROOT, 'tmp/input');
  const createFile = getCreateFile(inputDir);

  await Promise.all([
    {
      input: path.resolve(inputDir, 'docsanova.json'),
      output: path.resolve(tmpInput, '_data/docsanova.json'),
    },
    {
      input: path.resolve(ROOT, 'eleventy.config.cjs.mustache'),
      output: path.resolve(tmpInput, 'eleventy.config.cjs'),
    },
  ].map(async ({ input, output, }) => {
    if (!(existsSync(input))) {
      throw new Error(`File ${input} does not exist`);
    }
    return createFile(input, output, contents => Mustache.render(contents, {
      tmpInput,
      NODE_MODULES_FOLDER: nodeModulesDir,
      STYLES_FOLDER: 'styles',
      INTERNAL_JS_FOLDER: '_internal_js',
      JS_FOLDER: 'js',
    }));
  }));

  buildTSC(inputDir);

  await symlinkNodeModules(inputDir, tmpInput, nodeModulesDir);

  // For monitoring directories
  await Promise.all([
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
      input: path.resolve(inputDir, '.docsanova/js'),
      output: path.resolve(tmpInput, 'js'),
    },
  ].map(async ({ input, output, transform, }) => {
    const files = await glob(path.resolve(input, '**/*'));
    await Promise.all(files.map(async (inputFilepath) => {
      if (!statSync(inputFilepath).isDirectory()) {
        const filepath = inputFilepath.split(`${input}/`)[1];
        const outputFilepath = path.resolve(tmpInput, output, filepath);
        await createFile(inputFilepath, outputFilepath, transform);
      }
    }));
  }));

  const elev = new Eleventy(tmpInput, buildDir, {
    source: "cli",
    runMode: 'serve',
    quietMode: false,
    configPath: path.resolve(tmpInput, 'eleventy.config.cjs'),
    // pathPrefix: undefined,
    // dryRun: false,

  });
  await elev.init();
  await elev.write();
};

