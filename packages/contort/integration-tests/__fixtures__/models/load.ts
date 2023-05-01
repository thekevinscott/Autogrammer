import path from 'path';
import * as url from 'url';
import {
  pipeline, 
  env,
  PreTrainedModel,
  TextGenerationPipeline,
} from '@xenova/transformers';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = path.resolve(__dirname, './');

const models = new Map();

export const loadModel = (name: string) => {
  if (!models.has(name)) {
    models.set(name, pipeline('text-generation', name));
  }

  return models.get(name);
}
