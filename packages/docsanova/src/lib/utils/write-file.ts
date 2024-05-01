import path from 'path';
import pkg from 'fs-extra';
const {
  mkdirp,
  writeFile: _writeFile,
} = pkg;

export const writeFile = async (filepath: string, contents: string) => {
  const dirname = path.dirname(filepath);
  await mkdirp(dirname);
  return _writeFile(filepath, contents, 'utf8');
};
