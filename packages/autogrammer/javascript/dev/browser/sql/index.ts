import {
  pipeline,
  env,
} from '@xenova/transformers';
env.allowRemoteModels = true;
env.allowLocalModels = false;

import * as webllm from "@mlc-ai/web-llm";

import Autogrammer, {
  isSupportedLanguage,
} from 'autogrammer';
import '@vanillawc/wc-monaco-editor';
import type {
  ModelDefinition,
  ModelProtocol,
} from 'contort';

interface MonacoEditor extends HTMLElement {
  value: string;
}

const form = document.getElementById('form') as HTMLFormElement;
const button = document.getElementById('submit') as HTMLButtonElement;
const input = document.getElementById('input') as HTMLTextAreaElement;
const languageOptionsEditor = document.getElementById('language-options') as MonacoEditor;
const output = document.getElementById('output') as HTMLPreElement;
const selectLanguage = document.getElementById('language-selector') as HTMLSelectElement;
const selectModel = document.getElementById('model-selector') as HTMLSelectElement;

[
  'sql',
].forEach((language) => {
  const option = document.createElement('option');
  option.value = language;
  if (language === 'json') {
    option.selected = true;
  }
  option.innerText = language;
  selectLanguage.appendChild(option);
});

type ModelGetter = () => ModelDefinition<ModelProtocol>;
const models = ([
  ...[
    'Xenova/gpt2',
    'Xenova/codegen-350M-mono',
    'Xenova/llama-160m',
    'Xenova/WizardCoder-1B-V1.0',
  ].map(model => ([
    `Transformers.js - ${model}`,
    () => pipeline('text-generation', model),
  ])),
  ...[
    "Llama-3-8B-Instruct-q4f32_1",
    "Phi1.5-q4f32_1-1k",
  ].map(model => ([
    `web-llm - ${model}`,
    () => webllm.CreateEngine(model, {
      initProgressCallback: console.log,
    }),
  ])),
] as [string, ModelGetter][]).reduce<Record<string, ModelGetter>>((acc, [model, modelGetter,]) => {
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
Object.keys(models).reverse().forEach((model, i) => {
  const option = document.createElement('option');
  option.value = model;
  option.innerText = model;
  if (i === 0) {
    option.selected = true;
  }
  selectModel.appendChild(option);
});

const loadedModels = new Map<string, ModelDefinition<ModelProtocol>>();
const getModel = async (): Promise<ModelDefinition<ModelProtocol>> => {
  if (!loadedModels.get(selectModel.value)) {
    loadedModels.set(selectModel.value, await models[selectModel.value]());
  }
  const model = loadedModels.get(selectModel.value);
  if (!model) {
    throw new Error('Model not loaded');
  }
  return model;
};

const autogrammer = new Autogrammer({});

selectLanguage.onchange = () => {
  languageOptionsEditor.setAttribute('value', selectLanguage.value);
  autogrammer?.abort();
};

console.log(form);
form.onsubmit = async (e) => {
  e.preventDefault();
  await synthesize(input.value + "\n");
};

const n = 150;

let generating = false;

const origButtonText = button.innerText;
const synthesize = async (prompt: string) => {
  if (generating) {
    autogrammer?.abort();
    generating = false;
  } else {
    button.innerText = 'Abort';
    generating = true;

    autogrammer.model = await getModel();
    const language = selectLanguage.value;
    if (isSupportedLanguage(language)) {
      autogrammer.language = language;
    }

    try {

      const languageOptions = JSON.parse(languageOptionsEditor.value);
      await autogrammer.execute(prompt, {
        languageOptions,
        modelOptions: {
          n,

          stream: true,
          callback: ({ partial, }) => {
            output.textContent = partial;
          },
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      button.innerText = origButtonText;
      generating = false;
    }
    console.log('done synthesizing!');
  }
};

languageOptionsEditor.value = JSON.stringify({
  type: 'object',
  additionalProperties: false,
  properties: {
    number: { type: 'number', },
    street_name: { type: 'string', },
    street_type: { enum: ['Street', 'Avenue', 'Boulevard',], },
  },
  required: ['number', 'street_name', 'street_type',],
}, null, 2);
