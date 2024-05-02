import {
  pipeline,
  env,
} from '@xenova/transformers';
env.allowRemoteModels = true;
env.allowLocalModels = false;
import Autogrammer from 'autogrammer';
import '@vanillawc/wc-monaco-editor';
import { ModelDefinition, ModelProtocol, } from 'contort';
// const model = {
//   protocol: 'llamafile',
//   endpoint: import.meta.env.VITE_LLAMAFILE_ENDPOINT_URL,
// };
// debugger;
// const model = pipeline('text-generation', 'Xenova/phi-1_5_dev');
// const model = pipeline('text-generation', 'BricksDisplay/phi-1_5-q4');
// const model = pipeline('text-generation', 'Xenova/tiny-random-PhiForCausalLM');


const form = document.getElementById('form');
const button = document.getElementById('submit');
const input = document.getElementById('input') as HTMLTextAreaElement;
const grammarEditor = document.getElementById('grammar');
const output = document.getElementById('output');
const outputNoGrammar = document.getElementById('output-no-grammar');
const selectGrammar = document.getElementById('grammar-selector') as HTMLSelectElement;
const selectModel = document.getElementById('model-selector') as HTMLSelectElement;

[
  'json',
  'sql',
].forEach((language) => {
  const option = document.createElement('option');
  option.value = language;
  option.innerText = language;
  selectGrammar.appendChild(option);
});

type ModelGetter = () => ModelDefinition<ModelProtocol>;
const models = [
  'Xenova/gpt2',
  // 'Xenova/codegen-350M-mono',
  // 'Xenova/llama-160m',
  // 'Xenova/WizardCoder-1B-V1.0',
].reduce<Record<string, ModelGetter>>((acc, model) => {
  const modelGetter: ModelGetter = () => pipeline('text-generation', model);
  return {
    ...acc,
    [model]: modelGetter,
  };
}, {
  'llama.cpp': () => ({
    protocol: 'llama.cpp',
    endpoint: import.meta.env.VITE_LLAMACPP_ENDPOINT_URL,
  }),
  'llamafile': () => ({
    protocol: 'llamafile',
    endpoint: import.meta.env.VITE_LLAMAFILE_ENDPOINT_URL,
  }),
});
Object.keys(models).forEach(model => {
  const option = document.createElement('option');
  option.value = model;
  option.innerText = model;
  // if (model === 'Xenova/codegen-350M-mono') {
  //   option.selected = true;
  // }
  selectModel.appendChild(option);
});

let abortController: AbortController = new AbortController();

selectGrammar.onchange = () => {
  grammarEditor.setAttribute('value', selectGrammar.value);
  abortController.abort();
};

form.onsubmit = async (e) => {
  e.preventDefault();
  await synthesize(input.value + "\n");
};

const loadedModels = new Map();

const n = 150;

const synthesize = async (prompt: string) => {
  if (!loadedModels.get(selectModel.value)) {
    loadedModels.set(selectModel.value, await models[selectModel.value]());
  }
  const model = loadedModels.get(selectModel.value);
  console.log('Synthesize!');
  button.setAttribute('disabled', '');
  await Promise.all([
    (async () => {
      const autogrammer = new Autogrammer({
        model,
      });

      try {
        autogrammer.grammar = grammarEditor.value;

        await autogrammer.execute(prompt, {
          n,
          stream: true,
          callback: ({ partial, chunk, }) => {
            console.log('grammar', partial);
            output.textContent = partial;
          },
        });
        console.log('complete, grammar');
      } catch (err) {
        console.error(err);
      }
    })(),
    (async () => {
      const contortionist = new Contortionist({
        model,
      });
      try {
        await contortionist.execute(prompt, {
          n,
          stream: true,
          callback: ({ partial, chunk, }) => {
            console.log('nogrammar', partial);
            outputNoGrammar.textContent = partial;
          },
        });
        console.log('complete, no grammar');
      } catch (err) {
        console.error(err);
      }
    })(),
  ]);
  console.log('done synthesizing!');

  button.removeAttribute('disabled');
  abortController = new AbortController();

};

synthesize(input.value + '\n');

// grammarEditor.value = `
// root ::= item+

// # Excludes various line break characters
// item ::= "def " [a-zA-z]+ "(" arg ("," arg)* "):" \n
// arg ::= [a-zA-z]+
// `;
