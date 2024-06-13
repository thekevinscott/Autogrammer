import {
  pipeline,
  env,
  TextGenerationPipeline,
} from '@xenova/transformers';
env.allowRemoteModels = true;
env.allowLocalModels = false;
import Contortionist from '../../../src/index.js';
import { _ } from 'gbnf/builder';

// Specify a custom location for models (defaults to '/models/').
// env.localModelPath = '/';
const model = await pipeline('text-generation', 'Xenova/gpt2');
const contort = new Contortionist({
  model,
  grammar: _`
    [-._a-zA-Z0-9 \\n]+
  `,
});

const result = await contort.execute('What is your name?\n', {
  max_new_tokens: 1,
});
console.log(result);


// // import chess from '../grammars/chess.gbnf?raw';
// import json from '../grammars/json.gbnf?raw';

// // const model = pipeline('text-generation', 'Xenova/phi-1_5_dev', {
// const model = pipeline('text-generation', 'Xenova/gpt2', {
//   progress_callback: console.log,
// });


// const contort = new Contortionist({
//   model,
//   // grammar: `root ::= "foo" | "bar"`,
//   grammar: json,
//   // grammar: `root ::= "1. "`,
//   // grammar: `root ::= " ."`,
// });

// const output = await contort.execute('Describe the state of the world in JSON\n', {
//   callback: ({ partial, }) => console.log(partial),
//   llmOpts: {
//     max_new_tokens: 100,
//     // num_beams: 5,
//     no_repeat_ngram_size: 2,
//     early_stopping: true,
//   },
// });
// console.log('----- complete ------');
// console.log('output', output);
