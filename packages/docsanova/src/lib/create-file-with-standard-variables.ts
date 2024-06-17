import { CreateFile, } from "./types.js";
import path from 'path';
import Mustache from 'mustache';

export const createFileWithStandardVariables = (
  createFile: CreateFile,
  input: string,
  output: string,
  internalDir: string,
  devMode?: boolean,
) => createFile(input, output, contents => Mustache.render(contents, {
  USER_STYLES_FOLDER: path.join(internalDir, 'styles'),
  USER_JS_FOLDER: path.join(internalDir, 'js'),
  INTERNAL_JS_FOLDER: path.join(internalDir, '_internal_js'),
  DEV_MODE: devMode ? '1' : '0',
}));
