import Autogrammer from 'https://cdn.jsdelivr.net/npm/autogrammer/dist/index.js';
console.log(new Autogrammer({
  language: 'json',
}))
import {
  pipeline,
  env,
} from 'https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js';
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

const origLog = console.log.bind(console);

self.onconnect = (e) => {
  const port = e.ports[0];

  const post = (type: string, data: any) => {
    port.postMessage(JSON.stringify({
      type,
      data,
    }));
  };

  const log = (...msg: any[]) => {
    post('log', msg);
    origLog(...msg);
  };


  port.addEventListener("message", async (e: MessageEvent<string>) => {
    console.log = log;
    // TODO: One day it'd be great to resolve this using import maps
    const MAPPED_NAME: Record<string, string> = {
      'autogrammer': 'https://cdn.jsdelivr.net/npm/autogrammer/dist/index.js',
      '@xenova/transformers': 'https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js',
    }
    function esm(templateStrings: TemplateStringsArray, ...substitutions: string[]) {
      let js = templateStrings.raw[0];
      for (let i = 0; i < substitutions.length; i++) {
        js += substitutions[i] + templateStrings.raw[i + 1];
      }
      return URL.createObjectURL(new Blob([js], { type: 'text/javascript' }));
    }
    try {
      let script = e.data;
      const matches = script.matchAll(new RegExp('import(.+?)from(.+?)(\n)', 'gs'))

      const hoistedImports = [];

      for (const match of matches) {
        const importName = match[2].trim().replace(/["';]/g, "");
        console.log(importName);
        if ([
          'autogrammer',
          '@xenova/transformers',
        ].includes(importName)) {
          // console.log(importName, match[0]);
          const mappedName = MAPPED_NAME[importName];
          console.log(match[0], importName, mappedName)
          const replacedMatch = match[0].replace(importName, mappedName);
          hoistedImports.push(replacedMatch);
          script = script.replace(match[0], '');
        }
      };
      const lines = script.trim().split('\n').filter((line) => line.trim() !== '');
      // if (!lines[lines.length - 1].trim().startsWith('return')) {
      lines[lines.length - 1] = `return ${lines[lines.length - 1]}`;
      // }
      script = lines.join('\n')
      console.log('hoistedImports', hoistedImports);
      console.log(`script: "${script}"`);
      // const model = await getModel('Xenova/gpt2');
      // console.log('pipeline', await model('Hello, world!'));




      // const AsyncFunction = async function () { }.constructor;

      // const result = await AsyncFunction('main', `"use strict"; ${script};`)();

      // const code = `
      // const objectURL = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
      // const module = await import(objectURL);
      // URL.revokeObjectURL(objectURL);
      // const result = await module.default();

      // const fn = esm`export function fn() { return 'Hello!' }`;
      const fn = esm`
      export default async function fn(model) { 
        ${script}
      }
      `;
      const namespaceObject = await import(fn)
      URL.revokeObjectURL(fn);

      const result = await namespaceObject.default(pipeline);



      post('result', result);
    } catch (err: unknown) {
      log('error', (err as any).message);

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
