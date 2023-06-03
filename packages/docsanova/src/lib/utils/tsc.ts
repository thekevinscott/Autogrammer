import {
  WatchStatusReporter,
  type CompilerOptions,
} from "typescript";
import chalk from 'chalk';
import ts from 'typescript';
const {
  createWatchCompilerHost,
  createWatchProgram,
  createSemanticDiagnosticsBuilderProgram,
  findConfigFile,
  sys,
  readConfigFile,
  parseJsonConfigFileContent,
} = ts;

export const buildTSC = (buildDir: string, opts: CompilerOptions = {}) => {
  const configPath = findConfigFile(
    buildDir,
    sys.fileExists.bind(sys),
    "tsconfig.json"
  );

  if (!configPath) {
    throw new Error("Could not find a valid 'tsconfig.json'.");
  }

  const { config, } = readConfigFile(configPath, sys.readFile.bind(sys)) as {
    config: {
      compilerOptions: CompilerOptions;
      include?: CompilerOptions["include"];
      exclude?: CompilerOptions["exclude"];
      files?: CompilerOptions["files"];
      extends?: CompilerOptions["extends"];
    };
  };


  config.compilerOptions = Object.assign({}, config.compilerOptions, opts.compilerOptions);
  if (opts.include) {
    config.include = opts.include;
  }
  if (opts.exclude) {
    config.exclude = opts.exclude;
  }
  if (opts.files) {
    config.files = opts.files;
  }
  if (opts.extends) {
    config.files = opts.extends;
  }


  const { options, fileNames, errors, } = parseJsonConfigFileContent(config, sys, buildDir);
  const program = ts.createProgram({ options, rootNames: fileNames, configFileParsingDiagnostics: errors, });
  const { diagnostics, emitSkipped, } = program.emit();
  const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(diagnostics, errors);
  if (allDiagnostics.length) {
    const formatHost: ts.FormatDiagnosticsHost = {
      getCanonicalFileName: (path) => path,
      getCurrentDirectory: sys.getCurrentDirectory.bind(sys),
      getNewLine: () => sys.newLine,
    };
    const message = ts.formatDiagnostics(allDiagnostics, formatHost);
    console.warn(message);
  }
  if (emitSkipped) {
    process.exit(1);
  };
};

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
      console.log(chalk.cyan`[TS]`, diagnostic.messageText);
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

