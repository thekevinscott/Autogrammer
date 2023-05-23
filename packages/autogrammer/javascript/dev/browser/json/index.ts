import Autogrammer from "../../../src/index.js";
import '@vanillawc/wc-monaco-editor';

interface MonacoEditor {
  value: string;
}
const form = document.getElementById('form') as HTMLFormElement;
const button = document.getElementById('submit') as HTMLButtonElement;
const promptEditor = document.getElementById('prompt') as unknown as MonacoEditor;
const jsonEditor = document.getElementById('json') as unknown as MonacoEditor;
const output = document.getElementById('output') as HTMLPreElement;
const buttonText = button.innerText;

let generating = false;
const autogrammer = new Autogrammer({
  model: {
    protocol: 'llama.cpp',
    endpoint: import.meta.env.VITE_LLAMACPP_ENDPOINT_URL,
  },
  language: 'json',
});
form.onsubmit = async (e) => {
  e.preventDefault();
  if (generating) {
    generating = false;
    autogrammer.abort();
    button.innerText = buttonText;
  } else {
    generating = true;
    button.innerText = 'Abort';
    try {
      autogrammer.synthesize(promptEditor.value, {
        languageOptions: JSON.parse(jsonEditor.value),
        modelOptions: {
          n: 1000,
          // n_predict: 1000,
          callback: ({ partial }) => {
            console.log(partial)
            output.innerHTML = partial;
          },
        }
      });
    } finally {
      generating = false;
      button.innerText = buttonText;
    }
  }
};

promptEditor.value = `Parse the following address into a JSON object. 

It should contain the fields street name, number, and street type, in that order.

It should also contain the zip code.

"1600 Pennsylvania Avenue NW, Washington, DC 20500"`;
jsonEditor.value = JSON.stringify({
  type: 'object',
  properties: {
    number: { type: 'number' },
    street_name: { type: 'string' },
    street_type: { enum: ['Street', 'Avenue', 'Boulevard'] },
  },
  required: ['number', 'street_name', 'street_type']
}, null, 2);
