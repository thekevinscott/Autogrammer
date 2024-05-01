// eleventy.d.ts
declare module '@11ty/eleventy' {
  interface ConstructorOpts {
    source?: string;
    quietMode?: boolean;
    configPath?: string;
    pathPrefix?: string;
    runMode?: 'serve' | 'watch' | 'build';
    dryRun?: boolean;
  }
  export class Eleventy {
    constructor(input: string, output: string, opts?: ConstructorOpts);
    toJSON(): Promise<Record<string, unknown>>;
    init(): Promise<void>;
    watch(): Promise<void>;
    serve(port: string | number): void;
    write(): Promise<void>;
  }
}
