import { autogram } from '../../../src/index.js';
// import {
//   pipeline,
//   env,
// } from '@xenova/transformers';

// console.log('top!')

// env.allowRemoteModels = true;
// env.allowLocalModels = false;

const prompt = `Write me a SQL query that selects the column "foo" from "bar"`

// const warn = console.warn;
// console.warn = () => { };
// const model = await pipeline('text-generation', 'Xenova/gpt2');
// console.warn = warn;

// console.log('got model!')

// console.log((await model(prompt, {
//   temperature: 0,
// }))[0].generated_text.slice(prompt.length));

// console.log('1')
console.log(await autogram(prompt, {
  syntax: 'sql',
}, {
  max_new_tokens: 4,
  maximumDepth: 6,
  callback: console.log,
}));
