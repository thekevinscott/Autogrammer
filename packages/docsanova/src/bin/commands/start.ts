import { Command, } from "commander";
import {
  // StartOpts, 
  start,
} from "../../lib/start.js";

// async function main(opts: StartOpts) {
//   await start(opts);
// };

export const registerScript = (program: Command) => program.command('start')
  .description('Run Docs')
  .option('-p, --port <number>', 'Port', '8080')
  .option('-i, --input <string>', 'Input directory', './')
  .option('-c, --contentDir <string>', 'Content directory', 'content')
  .option('-s, --srcDir <string>', 'src directory', 'src')
  .action(start);
