#!/usr/bin/env node

import { Command, } from 'commander';
import {
  registerScript as registerScriptStart,
} from './commands/start.js';
import {
  registerScript as registerScriptBuild,
} from './commands/build.js';
import { readFileSync, } from 'fs';

const packageJSONPath = import.meta.url.replace(/\/[^/]+$/, '/../../package.json');
const { name, version, description, } = JSON.parse(readFileSync(new URL(packageJSONPath), 'utf-8')) as { name: string, version: string, description: string, };

const main = async () => {
  const program = new Command();

  program
    .name(name)
    .description(description)
    .version(version);

  await Promise.all([
    registerScriptStart,
    registerScriptBuild,
  ].map(fn => fn(program)));

  await program.parseAsync(process.argv);
};

await main();
