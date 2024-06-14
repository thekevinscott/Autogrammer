import {
  pipeline,
  env,
} from '@xenova/transformers';
env.allowRemoteModels = false;
env.allowLocalModels = true;

// Specify a custom location for models (defaults to '/models/').
env.localModelPath = '/';
const model = await pipeline('text-generation', 'phi-1_5_dev');

const result = await model('Write me a list of numbers:\n');
console.log('result', result);

