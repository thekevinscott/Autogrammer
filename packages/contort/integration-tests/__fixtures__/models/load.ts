import path from 'path';
import * as url from 'url';
import {
  pipeline,
  env,
  PreTrainedModel,
  TextGenerationPipeline,
} from '@xenova/transformers';

env.allowRemoteModels = true;
env.allowLocalModels = false;
// env.allowRemoteModels = false;
// env.allowLocalModels = true;
// env.localModelPath = path.resolve(url.fileURLToPath(new URL('.', import.meta.url)), './');

const models = new Map();

export const loadModel = (name: string) => {
  if (!models.has(name)) {
    models.set(name, pipeline('text-generation', name));
  }

  return models.get(name);
}
