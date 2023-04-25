import Autogrammer from '../../../packages/autogrammer/src/index.js';
import { pipeline } from '@xenova/transformers';
// const model = pipeline('text-generation', 'Xenova/gpt2');

const synth = new Autogrammer({
  language: 'sql',
  // model,
  model: {
    protocol: 'llama.cpp',
    endpoint: import.meta.env.VITE_LLAMACPP_ENDPOINT_URL,
  }
});

let abortController: AbortController = new AbortController();

const form = document.getElementById('form');
const button = document.getElementById('submit');
const input = document.getElementById('input') as HTMLTextAreaElement;
const output = document.getElementById('output');

form.onsubmit = async (e) => {
  e.preventDefault();
  await synthesize(input.value);
};


const synthesize = async (prompt: string) => {
  button.setAttribute('disabled', '');
  console.log('1')
  const result = await synth.synthesize(prompt, {
    selectlist: ['foo', 'bar', 'bar2', 'foo2', 'userid', 'username', 'created', 'modified'],
    tablename: ['baz'],
  }, {
    // n: 400,
    n: 4,
    stream: true,
    callback: ({ partial }) => {
      output.textContent = partial;
    }
  });
  console.log('2')
  console.log('result', result)

  button.removeAttribute('disabled');
  abortController = new AbortController();
};

synthesize(input.value);
