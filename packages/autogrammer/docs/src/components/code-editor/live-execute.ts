import {
  pipeline,
  env,
  type TextGenerationPipeline,
} from '@xenova/transformers';
import { esm } from './build-esm.js';
env.allowRemoteModels = true;
env.allowLocalModels = false;
const models = new Map<string, Promise<TextGenerationPipeline>>();
const getModel = async (name: string): Promise<TextGenerationPipeline> => {
  if (!models.has(name)) {
    models.set(name, pipeline('text-generation', name));
  }
  const model = models.get(name);
  if (!model) {
    throw new Error(`${name} must be defined`);
  }
  return model;
};

// getModel('Xenova/gpt2') // preload

type ErrorCallback = (error: Error) => void;
type LogCallback = (...data: unknown[]) => void;
export const liveExecute = async (script: string, callback: LogCallback, errCallback: ErrorCallback) => {
  const matches = script.matchAll(new RegExp('import(.+?)from(.+?)(\n)', 'gs'))

  const hoistedImports = [];

  for (const match of matches) {
    hoistedImports.push(match[0]);
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
  const fn = esm`${hoistedImports.join('\n')}
      export default async function fn(models, callback, errCallback) { 
        console.log = callback;
        try {
        ${script}
        } catch(err) {
          errCallback(err);

        }
      }
      `;
  const namespaceObject = await import(fn);
  try {
    await namespaceObject.default(models, callback, errCallback);
  } catch (err) {
    console.error(err);
  } finally {
    URL.revokeObjectURL(fn);
  }
  // return result;
};
