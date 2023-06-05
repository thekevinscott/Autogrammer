// import Autogrammer from 'https://cdn.jsdelivr.net/npm/autogrammer/dist/index.js';
// console.log(new Autogrammer({
//   language: 'json',
// }))
import { serializeError, deserializeError } from 'https://cdn.jsdelivr.net/npm/serialize-error/index.js';
import {
  pipeline,
  env,
} from 'https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js';
import type {
  TextGenerationPipeline,
} from '@xenova/transformers';
env.allowRemoteModels = true;
env.allowLocalModels = false;
const models = new Map<string, any>();
const getModel = async (name: string) => {
  if (!models.has(name)) {
    models.set(name, pipeline('text-generation', name));
  }
  return models.get(name);
};

// self.getModel = getModel;
getModel('Xenova/gpt2') // preload

// const origLog = console.log.bind(console);

self.onconnect = (e) => {
  const port = e.ports[0];

  const post = (type: string, data?: any) => {
    port.postMessage(JSON.stringify({
      type,
      data,
    }));
  };

  const log = (...data: unknown[]) => {
    post('log', data);
  };
  const error = (...data: unknown[]) => {
    post('error', data.map(serializeError));
  };

  const consoleLog = (...data: unknown[]) => {
    post('worker-log', data);
  };
  const consoleError = (...data: unknown[]) => {
    post('worker-error', data);
  };

  port.addEventListener("message", async ({ data }: MessageEvent<{
    id: string;
    script: string;
    root: string;
  }>) => {

    const { id, root } = data;

    consoleLog(`[${id}] starting cell execution...`);

    // TODO: One day it'd be great to resolve this using import maps
    // https://github.com/WICG/import-maps/issues/2
    const MAPPED_NAME: Record<string, string> = {
      'autogrammer': `${root}/_nm/bundled-autogrammer/dist/index.js`,
      '@xenova/transformers': 'https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js',
    }
    try {
      let script = data.script;
      // const matches = script.matchAll(new RegExp('import(.+?)from(.+?)(\n)', 'gs'))

      // const hoistedImports = [];

      // for (const match of matches) {
      //   const importName = match[2].trim().replace(/["';]/g, "");
      //   console.log(importName);
      //   if ([
      //     'autogrammer',
      //     '@xenova/transformers',
      //   ].includes(importName)) {
      //     // console.log(importName, match[0]);
      //     const mappedName = MAPPED_NAME[importName];
      //     console.log(match[0], importName, mappedName)
      //     const replacedMatch = match[0].replace(importName, mappedName);
      //     hoistedImports.push(replacedMatch);
      //     script = script.replace(match[0], '');
      //   }
      // };
      // const lines = script.trim().split('\n').filter((line) => line.trim() !== '');
      // // if (!lines[lines.length - 1].trim().startsWith('return')) {
      // lines[lines.length - 1] = `return ${lines[lines.length - 1]}`;
      // // }
      // script = lines.join('\n')
      // console.log('hoistedImports', hoistedImports);
      // console.log(`script: "${script}"`);
      // // const model = await getModel('Xenova/gpt2');
      // // console.log('pipeline', await model('Hello, world!'));




      // // const AsyncFunction = async function () { }.constructor;

      // // const result = await AsyncFunction('main', `"use strict"; ${script};`)();

      // // const code = `
      // // const objectURL = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
      // // const module = await import(objectURL);
      // // URL.revokeObjectURL(objectURL);
      // // const result = await module.default();

      // // const fn = esm`export function fn() { return 'Hello!' }`;
      // const fn = esm`
      // export default async function fn(model) { 
      //   ${script}
      // }
      // `;

      const matches = script.matchAll(new RegExp('import(.+?)from(.+?)(\n)', 'gs'))

      const hoistedImports = [];

      for (const match of matches) {
        const importName = match[2].trim().replace(/["';]/g, "");

        if ([
          'autogrammer',
          '@xenova/transformers',
        ].includes(importName)) {
          // console.log(importName, match[0]);
          const mappedName = MAPPED_NAME[importName];
          const replacedMatch = match[0].replace(importName, mappedName);
          hoistedImports.push(replacedMatch);
        } else {
          hoistedImports.push(match[0]);
        }
        script = script.replace(match[0], '');
      };
      // for (const match of script.matchAll(new RegExp(`pipeline\(["']text-generation["'],(.+?)\)`, 'gs'))) {
      const models: Record<string, Promise<TextGenerationPipeline>> = {};
      for (const match of script.matchAll(new RegExp(`pipeline\\(["']text-generation["'],(.+?)\\)`, 'gs'))) {
        const modelName = match[1].trim().replace(/["']/g, "");
        models[modelName] = getModel(modelName);
        script = script.replace(match[0], `models["${modelName}"]`);
      }
      const lines = script.trim().split('\n').filter((line) => line.trim() !== '');
      // lines[lines.length - 1] = `return ${lines[lines.length - 1]}`;
      script = lines.join('\n');
      const fullScript = [
        ...hoistedImports.map(i => i.trim() + ';'),
        `export default async function fn(models, callback, errCallback) { 
        console.log = callback;
        console.error = errCallback;
        try {
        ${script}
        } catch(err) {
          errCallback(err);

        }
      }
      `].join('\n');
      // log(fullScript);
      const fn = esm`${fullScript.trim()}`;
      const namespaceObject = await import(fn)
      URL.revokeObjectURL(fn);

      await namespaceObject.default(models, log, error);

      // post('result', result);
    } catch (err: unknown) {
      consoleError('error', (err as any).message);
    } finally {
      consoleLog(`[${id}] completed cell execution...`);
      post('complete');
    }
  });

  port.start();
};

declare global {
  interface Window {
    // Autogrammer: typeof Autogrammer;
    getModel: typeof getModel;
    onconnect: (e: {
      ports: MessagePort[];
    }) => void;
  }
}

function esm(templateStrings: TemplateStringsArray, ...substitutions: string[]) {
  let js = templateStrings.raw[0];
  for (let i = 0; i < substitutions.length; i++) {
    js += substitutions[i] + templateStrings.raw[i + 1];
  }
  return URL.createObjectURL(new Blob([js], { type: 'text/javascript' }));
}
