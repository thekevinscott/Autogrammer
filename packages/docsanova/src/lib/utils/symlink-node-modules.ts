import pkg from 'fs-extra';
const {
  mkdirp,
  realpath,
  // symlink,
} = pkg;

import path from 'path';
import { symlink, } from 'fs';
import { getPackageJSON, } from './get-package.js';

export const symlinkNodeModules = async (inputDir: string, tmpInput: string, nodeModulesDir: string) => {
  const dependencies = Object.keys(getPackageJSON(inputDir).dependencies).filter(name => {
    return !['docsanova',].includes(name);
    // && [
    //   'gbnf',
    //   // 'contort', 'autogrammer',
    // ].includes(name);
  });
  await Promise.all(dependencies.map(async (name) => {
    const src = await realpath(path.resolve(inputDir, 'node_modules', name));
    const dest = path.resolve(tmpInput, nodeModulesDir, name);
    await mkdirp(path.dirname(dest));
    // console.log('symlinking', src, dest);
    symlink(src, dest, 'dir', (err) => {
      if (err) {
        console.error(err);
      }
    });
  }));
};
