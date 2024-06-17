import {
  Eleventy,
} from "@11ty/eleventy";
import chokidar from 'chokidar';
import pkg from 'fs-extra';
const {
  mkdirp,
  unlink,
} = pkg;

export interface StartOpts extends Opts {
  port: number;
}

import path from 'path';
import { Opts, } from './types.js';
import { getCreateFile, } from './utils/get-create-file.js';
import { isExcluded, } from './utils/is-excluded.js';
import { TSCWatcher, } from './utils/tsc.js';
import { getConfigurationFiles, getContentDirectories, } from './definitions.js';
import { createFileWithStandardVariables, } from './create-file-with-standard-variables.js';
import { waitUntilAllFilesWritten, } from './wait-until-all-files-written.js';

export const start = async ({
  port,
  input: inputDir,
  contentDir,
  srcDir,
  output: buildDir,
  internalDir,
}: StartOpts) => {
  for (const { name, dir, } of [
    { name: 'input', dir: inputDir, },
    { name: 'output', dir: buildDir, },
    { name: 'content', dir: contentDir, },
    { name: 'src', dir: srcDir, },
    { name: 'internals', dir: internalDir, },
  ]) {
    if (!dir) {
      throw new Error(`No ${name} specified`);
    }
  }
  const createFile = getCreateFile(inputDir);
  await Promise.all([
    mkdirp(buildDir),
    mkdirp(internalDir),
  ]);

  // Write .docsanova.json and eleventy config
  await waitUntilAllFilesWritten(
    getConfigurationFiles(
      inputDir, internalDir
    ),
    ({
      input,
      output,
    }) => createFileWithStandardVariables(
      createFile,
      input,
      output,
      internalDir,
      true,
    ),
  );

  // For monitoring directories
  getContentDirectories({
    inputDir,
    contentDir,
    srcDir,
    internalDir,
  }).forEach(({
    input,
    output,
    transform,
  }) => {
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

  const elev = new Eleventy(internalDir, buildDir, {
    source: "cli",
    runMode: 'serve',
    quietMode: false,
    configPath: path.resolve(internalDir, 'eleventy.config.cjs'),
  });
  await elev.init();
  await elev.watch();
  elev.serve(port);
};

