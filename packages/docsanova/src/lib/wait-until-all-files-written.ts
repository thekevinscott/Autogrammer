import chokidar from 'chokidar';
import pkg from 'fs-extra';
import { getPromise, } from './utils/get-promise.js';
import type {
  FileDefinition,
} from './types.js';

const {
  existsSync,
} = pkg;

export const waitUntilAllFilesWritten = async (
  files: FileDefinition[],
  createFile: (file: FileDefinition) => Promise<void>,
) => {
  const [ready, readyCallback,] = getPromise();
  let written = 0;
  files.forEach(({ input, output, }) => {
    if (!(existsSync(input))) {
      throw new Error(`File ${input} does not exist`);
    }
    chokidar.watch(input).on('all', (
      event,
    ) => {
      if (event === 'add' || event === 'change') {
        written += 1;
        if (written >= 2) {
          readyCallback();
        }
        void createFile({ input, output, });
      } else if (!['addDir',].includes(event)) {
        console.log('[Unknown Event]', event);
      }
    });
  });
  await ready;
};
