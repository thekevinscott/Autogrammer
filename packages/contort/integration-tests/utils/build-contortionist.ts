import path from 'path';
import * as url from 'url';
import {
  exists,
  readdir,
} from 'fs-extra';
import util from 'util';
import { exec as _exec, } from 'child_process';
const exec = util.promisify(_exec);

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const CONTORT_DIR = path.resolve(ROOT_DIR, './');

export const buildContortionist = async () => {
  await exec('pnpm build', {
    cwd: CONTORT_DIR,
  });
  const DIST = path.resolve(CONTORT_DIR, './dist');
  if (!(await exists(DIST))) {
    const files = await readdir(CONTORT_DIR);
    throw new Error(`Dist folder for contort does not exist: ${JSON.stringify(files, null, 2)}`);
  }
  if (!(await exists(path.resolve(DIST, 'index.js')))) {
    const files = await readdir(DIST);
    throw new Error(`./dist/index.js for contort does not exist: ${JSON.stringify(files, null, 2)}`);
  }
};

