import {
  WatchStatusReporter,
  type CompilerOptions,
} from "typescript";
import chalk from 'chalk';
import ts from 'typescript';
const {
  createWatchProgram,
  createWatchCompilerHost,
  createSemanticDiagnosticsBuilderProgram,
  findConfigFile,
  sys,
} = ts;

export class TSCWatcher {
  constructor(watchDir: string, opts: CompilerOptions = {}) {
    const configPath = findConfigFile(
      watchDir,
      sys.fileExists.bind(sys),
      "tsconfig.json"
    );

    if (!configPath) {
      throw new Error("Could not find a valid 'tsconfig.json'.");
    }

    const watchStatusReporter: WatchStatusReporter = (diagnostic) => {
      console.log(chalk.red`[TS]`, diagnostic.messageText);
    };

    const host = createWatchCompilerHost(
      configPath,
      opts,
      sys,
      createSemanticDiagnosticsBuilderProgram,
      undefined,
      watchStatusReporter,
    );

    createWatchProgram(host);
  }
}

