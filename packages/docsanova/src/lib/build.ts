import {
  Eleventy,
} from "@11ty/eleventy";
import pkg from 'fs-extra';
const {
  mkdirp,
} = pkg;
import { glob, } from 'glob';

import path from 'path';
import { Opts, } from './types.js';
import { getCreateFile, } from './utils/get-create-file.js';
import { readdirSync, statSync, } from 'fs';
import { buildTSC, } from './utils/tsc.js';
import { waitUntilAllFilesWritten, } from './wait-until-all-files-written.js';
import { getConfigurationFiles, getContentDirectories, } from './definitions.js';
import { createFileWithStandardVariables, } from './create-file-with-standard-variables.js';

export const build = async ({
  input: inputDir,
  output: buildDir,
  contentDir,
  srcDir,
  internalDir,
}: Opts) => {
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

  const configFiles = getConfigurationFiles(inputDir, internalDir,);
  await waitUntilAllFilesWritten(
    configFiles,
    ({
      input,
      output,
    }) => createFileWithStandardVariables(createFile, input, output, internalDir),
  );

  buildTSC(inputDir);

  // For monitoring directories
  const contentDirectories = getContentDirectories({
    inputDir,
    contentDir,
    srcDir,
    internalDir,
  });
  await Promise.all(contentDirectories.map(async ({
    input,
    output,
    transform,
  }) => {
    const files = await glob(path.resolve(input, '**/*'));
    return Promise.all(files.map(async (inputFilepath) => {
      if (!statSync(inputFilepath).isDirectory()) {
        const filepath = inputFilepath.split(`${input}/`)[1];
        const outputFilepath = path.resolve(internalDir, output, filepath);
        await createFile(inputFilepath, outputFilepath, transform);
      }
    }));
  }));

  console.log('post content dirs, read the directory', path.resolve(internalDir, 'js'), readdirSync(path.resolve(internalDir, 'js')));

  const elev = new Eleventy(internalDir, buildDir, {
    source: "cli",
    runMode: 'serve',
    quietMode: false,
    configPath: path.resolve(internalDir, 'eleventy.config.cjs'),
  });

  await elev.init();

  await elev.write();

  console.log('post elev write', readdirSync(path.resolve(internalDir, 'js')));

  // TODO: Remove this
  process.exit(0);
};

