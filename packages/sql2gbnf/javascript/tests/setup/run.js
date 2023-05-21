import { createVitest } from 'vitest/node';
import { parseCLI } from 'vitest/node'


import * as url from 'url';
import path from 'path';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const { filter, options } = parseCLI(`vitest --config ${path.resolve(__dirname, '../../vitest.config.coverage.ts',)} run`)
// console.log(options)

const vitest = await createVitest('test', {
  ...options,
  watch: false,
})
await vitest.start(filter, {
  watch: false,
});

await vitest?.close();

const files = vitest.state.getFiles();
for (const file of files) {
  for (const suite of file.tasks) {
    for (const { result } of suite.tasks) {
      console.log(result.state);
    }
  }
}
// console.log(files);
// for (let i = 0; i < )
// console.log(vitest.state.getFiles()[0].tasks[0].tasks[0].result.state);
