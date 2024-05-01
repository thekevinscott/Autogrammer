import path from 'path';
import pkg from 'fs-extra';
import { writeFile, } from './write-file.js';
const {
  readFile,
} = pkg;

export const getCreateFile = (origInput: string) => async (filepath: string, targetPath: string, transform: (contents: string) => string = c => c): Promise<void> => {
  const origInputPath = path.resolve(origInput, filepath);
  const contents = await readFile(origInputPath, 'utf8',);
  return writeFile(targetPath, transform(contents).trim());
};
