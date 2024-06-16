import { Command, } from "commander";
import {
  // StartOpts, 
  build,
} from "../../lib/build.js";

export const registerScript = (program: Command) => program.command('build')
  .description('Build Docs')
  .option('-i, --input <string>', 'Input directory', './')
  .option('-o, --output <string>', 'Output directory', './build')
  .option('-c, --contentDir <string>', 'Content directory', 'content')
  .option('-s, --srcDir <string>', 'src directory', 'src')
  .action(build);
