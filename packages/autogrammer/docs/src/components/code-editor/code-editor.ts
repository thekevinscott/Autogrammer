import {
  LitElement,
  css,
  html
} from 'lit';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
// import { styleMap } from 'lit/directives/style-map.js';
import {
  query,
  state,
} from 'lit/decorators.js';
import 'https://cdn.jsdelivr.net/npm/@vanillawc/wc-codemirror@2.1.0/index.min.js';
import 'https://cdn.jsdelivr.net/npm/@vanillawc/wc-codemirror@2.1.0/mode/javascript/javascript.js';
import '@alenaksu/json-viewer';


// import "https://cdn.jsdelivr.net/gh/vanillawc/wc-code@1.0.3/src/wc-code.js";
// import Autogrammer from 'https://cdn.jsdelivr.net/npm/autogrammer/dist/index.js';
import { liveExecute } from './live-execute.js';
// import type { WCCodeMirror } from '@vanillawc/wc-codemirror';
// import * as webllm from "@mlc-ai/web-llm";
// console.log('pipeline', pipeline)
// env.allowRemoteModels = true;
// env.allowLocalModels = false;
// console.log('ab', Autogrammer)
// const model = webllm.CreateEngine("phi-2-q4f32_1-MLC", {
// const model = webllm.CreateEngine("Phi1.5-q4f32_1-1k", {
// const model = webllm.CreateEngine("Llama-3-8B-Instruct-q4f32_1", {
//   initProgressCallback: console.log,
// });
// const model = pipeline('text-generation', 'Xenova/gpt2');
// (window as any)['autogrammer'] = new Autogrammer({
//   language: 'json',
//   // model: webllm.CreateEngine("Phi1.5-q4f32_1-1k", {
//   // model,
// });

export const TAG_NAME = 'code-editor';

interface WCCodeMirror extends HTMLElement {
  value: string;
  editor: any;
}

export class CodeEditor extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    slot {
      display: none;
    }

    #container {
      display: block;
      position: relative;
      margin-bottom: 20px;
    }

    wc-codemirror {
      border: 1px solid var(--color-code-editor-border-color);
      border-bottom: 3px solid var(--color-code-editor-border-color);
      border-radius: 4px 4px 0 0;
      overflow: hidden;
      min-height: 100px;
      max-height: 1000px;
      overflow: scroll;
    }
    #output {
      border: 1px solid var(--color-code-editor-border-color);
      border-top: none;
      border-radius: 0 0 4px 4px;
      overflow: scroll;
      height: 140px;
      background-color: var(--color-code-editor-output);
      font-family: monospace;
      position: relative;
      padding-left: 10px;
      padding-top: 5px;
    }

    json-viewer {
      /* Background, font and indentation */
      --background-color: transparent;
      --color: #f8f8f2;
      --font-family: monaco, Consolas, 'Lucida Console', monospace;
      --font-size: 1rem;
      --indent-size: 1.5em;
      --indentguide-size: 1px;
      --indentguide-style: solid;
      --indentguide-color: #333;
      --indentguide-color-active: #666;
      --indentguide: var(--indentguide-size) var(--indentguide-style) var(--indentguide-color);
      --indentguide-active: var(--indentguide-size) var(--indentguide-style) var(--indentguide-color-active);
  
      /* Types colors */
      --string-color: #CD463A;
      --number-color: #28545b;
      --boolean-color: #1f4d54;
      --null-color: #a2a5a6;
      --property-color: #CD463A;
  
      /* Collapsed node preview */
      --preview-color: rgba(222, 175, 143, 0.9);
  
      /* Search highlight color */
      --highlight-color: #6fb3d2;
    }

    sl-button#run {
      position: absolute;
      right: 0;
      margin-top: -43px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2;
      border: none;
      cursor: pointer;
      border-bottom: none;
    }
    sl-button::part(base) {
      border-radius: 4px 0 0 0;
      border-bottom: none;
    }
    sl-button span {
      opacity: 0.6;
    }
    .cm-s-neo .CodeMirror-cursor {
      border-left: 1px solid red;
      background: transparent;
    }
  `;

  static readonly metadata = {
    version: '0.1.0',
    tag: TAG_NAME,
  };

  worker = new SharedWorker('/js/components/code-editor/worker.js', {
    type: 'module'
  });

  constructor() {
    super();
    this.worker.port.start();
    this.worker.port.addEventListener('message', e => {
      const { type, data } = JSON.parse(e.data);
      if (type === 'log' || type === 'error') {
        this.output.push(data.length === 1 ? data[0] : data);
      } else if (type === 'worker-log') {
        console.log(...data);
      } else if (type === 'worker-error') {
        console.error(...data);
      } else if (type === 'complete') {
        this.running = false;
      }
    });

    const html = document.getElementsByTagName('html')[0];
    this.observer = new MutationObserver((mutations) => mutations.forEach(() => {
      this.mode = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }));
    this.observer.observe(html, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  @state()
  protected mode: 'light' | 'dark' = 'light';

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  observer: MutationObserver;

  ref: Ref<WCCodeMirror> = createRef();

  get script(): WCCodeMirror {
    const script = this.ref.value;
    if (!script) {
      throw new Error('CodeMirror not found');
    }
    return script;
  }

  handleSlotchange(e: Event) {
    const target = e.target as HTMLSlotElement;
    const childNodes = target.assignedNodes({ flatten: true });
    this.script.value = childNodes.map((node) => typeof node === 'string' ? node : node.textContent ? node.textContent : '').join('').trim();
  }

  handleSubmit = (e: Event) => {
    e.preventDefault();
    this.execute();
  };

  handleKeydown = (e: KeyboardEvent) => {
    if (e.code === 'Enter' && e.metaKey) {
      this.execute();
    }
  }

  @state()
  protected output: (unknown)[] = [];

  @state()
  protected running = false;

  execute = async () => {
    this.running = true;
    this.output = [];
    this.worker.port.postMessage({
      id: `${Math.random()}`,
      root: window.location.origin,
      script: this.script.value,
    });
  }

  protected render() {
    console.log('in render, the mode', this.mode);
    return html`
      <div id="container" @keydown=${this.handleKeydown}>
      <div id="codemirror-container">

        <wc-codemirror 
          mode="javascript" 
          theme="${this.mode === 'dark' ? 'seti' : 'neo'}" 
          ${ref(this.ref)}
        >
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vanillawc/wc-codemirror/theme/neo.css">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vanillawc/wc-codemirror/theme/seti.css">
        </wc-codemirror>
        </div>
        <form @submit=${this.handleSubmit}>
        <sl-button 
          type="submit"
          variant="default" 
          id="run" 
          ?loading=${this.running}
        >Run <span>(⌘+⏎)</span></sl-button>
        </form>
        <div id="output">
        ${this.output.map((output) => {
      // <json-viewer .data=${output}></json-viewer>
      if (typeof output === 'object') {
        return html`
            ${JSON.stringify(output)}
          `;
      }
      return output;
    })}

        </div>
        </div>
        <slot @slotchange=${this.handleSlotchange}></slot>
      `;

  }
}
