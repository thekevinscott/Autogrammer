import {
  pipeline,
  env,
  AutoTokenizer,
  AutoModelForCausalLM,
  TextGenerationPipeline,
} from '@xenova/transformers';
env.allowRemoteModels = true;
env.allowLocalModels = false;
import Contort from '../../../src/index.js';

const modelId = 'Xenova/gpt2';


const contort2 = new Contort({
  model: {
    protocol: 'transformers.js',
    model: AutoModelForCausalLM.from_pretrained(modelId),
    tokenizer: AutoTokenizer.from_pretrained(modelId),
  }
});
const pipelineResult = await contort2.execute('Write me a list of numbers:\n');


const contort = new Contort({ model: pipeline('text-generation', modelId) });
const tokResult = await contort.execute('Write me a list of numbers:\n');

console.log(pipelineResult, '******', tokResult);


// contort


// console.log('tokenizer', tokenizer)

// const inputs = tokenizer('foo');
// console.log('inputs', inputs)
// const outputs = await model.generate(inputs.input_ids, {
//   max_new_tokens: 5,
// }, undefined, {
//   inputs_attention_mask: inputs.attention_mask,
// });
// const outputText = tokenizer.batch_decode(outputs, { skip_special_tokens: false });
// console.log('outputs!', outputText);
// debugger;

