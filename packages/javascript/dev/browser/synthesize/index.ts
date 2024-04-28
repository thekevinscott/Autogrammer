import { synth } from './code.js';


let abortController: AbortController = new AbortController();

const form = document.getElementById('form');
const button = document.getElementById('submit');
const input = document.getElementById('input') as HTMLTextAreaElement;
const output = document.getElementById('output');
const validity = document.getElementById('validity');

form.onsubmit = async (e) => {
  e.preventDefault();
  await synthesize(input.value);
};

const synthesize = async (prompt: string) => {
  button.setAttribute('disabled', '');
  let last = '';
  let numberOfLast = 0;
  try {
    const result = await synth.synthesize(prompt, 'foo', {
      n: 400,
      stream: true,
      callback: ({ partial }) => {

        // check for generating blank spaces, if so abort
        // abortController.abort();
        output.textContent = partial;
        const trimmed = partial.trim();
        if (last !== trimmed) {
          last = trimmed;
          numberOfLast = 0;
        } else if (numberOfLast >= 3) {
          synth.abort();
        } else {
          numberOfLast++;
        }
      }
    });
    try {
      output.textContent = JSON.stringify(JSON.parse(result), null, 2);
      validity.textContent = 'Valid JSON';
    } catch (err) {
      validity.textContent = 'Invalid JSON';
    }
  } catch (err) {
    // console.error(err);
  }

  button.removeAttribute('disabled');
  abortController = new AbortController();
};

// synthesize(input.value);
