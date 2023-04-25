import { buildJSON } from '../../../packages/autogrammer/src/build-json.js';
const form = document.getElementById('form');
const button = document.getElementById('submit');
const jsonEditor = document.getElementById('json');
const output = document.getElementById('output');

form.onsubmit = async (e) => {
  e.preventDefault();
  button.setAttribute('disabled', '');
  try {
    output.innerHTML = await generateJSON(jsonEditor.value);
  } finally {
    button.removeAttribute('disabled');
  }
};

const generateJSON = async (prompt: string) => {
  try {
    const value = JSON.parse(jsonEditor.value);
    const rules = buildJSON(value);
    console.log('rules', rules);
    return rules.join('\n');
  } catch (err) {
    throw new Error(`Invalid JSON: ${err.message}`);
  }
};

jsonEditor.value = JSON.stringify({
  type: 'object',
  properties: {
    str: {
      type: 'string',
    },
    arr: {
      type: 'array',
      items: {
        type: 'number',
      }
    },
    obj: {
      type: {
        type: 'object',
        properties: {
          foo: {
            type: 'boolean',
          }
        }
      },
    }
  }
}, null, 2);
