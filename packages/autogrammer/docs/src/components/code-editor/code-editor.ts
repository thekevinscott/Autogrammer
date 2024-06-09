import {
  LitElement,
  PropertyValueMap,
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
import { CodeEditorCodeMirror } from './code-mirror.js';
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

export class CodeEditor extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    :host {
      --ce-max-width: 100%;
      --ce-margin: 40px auto 60px auto;
    }
    * {
      box-sizing: border-box;
    }
    slot {
      display: none;
    }

    #container {
      display: block;
      position: relative;
      max-width: var(--ce-max-width);
      margin: var(--ce-margin);
    }

    wc-codemirror {
      // border: 1px solid var(--color-code-editor-border-color);
      border-radius: 4px 4px 0 0;
      overflow: hidden;
      min-height: 100px;
      max-height: 1000px;
      overflow: scroll;
      border-bottom: none;
    }
    #output {
      // border: 1px solid var(--color-code-editor-border-color);
      border-top: none;
      border-radius: 0 0 4px 4px;
      overflow: scroll;
      display: flex;
      flex-direction: column;
      // height: 40px;
      background-color: var(--color-code-editor-output);
      font-family: monospace;
      position: relative;
      // padding: 5px 0px;
      transition-duration: 0.2s;
      height: 50px;
      overflow-y: scroll;
    }
      #output.active {
        height: 260px;
      }

    #output-inner {
      // border-top: 1px solid rgba(0,0,0,0.4); 
      background-color: rgba(0,0,0,0.1);
      flex: 1;
      padding: 5px 10px;
      color: red;
    }

    .chat-bubble {
      margin: calc(var(--padding) * 4);
      background: white;
      box-shadow: 0 3px 3px rgba(0,0,0,0.1);
      padding: calc(var(--padding) * 4);
      border-radius: calc(var(--padding) * 2);
      max-width: 50%;
    }

    form {
      // margin-top: -4px;
      position: relative;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 5px 0;
      box-shadow: 0 2px 2px rgba(0,0,0,0.1);
    }

    sl-button {
      & #run {
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2;
        border: none;
        cursor: pointer;
        border-bottom: none;
      }
    }

    sl-button#loading::part(base) {
          width: 100%;
          background-color: transparent;
          border-color: transparent;
          color: red;
}

    sl-button::part(base) {
      // --sl-input-height-medium: 48px;
      // padding: 0 20px;
      // font-size: 1.2rem;
      border-radius: 8px;
      cursor: pointer;

    }

  sl-button::part(base):hover {
  color: black;
  border-color: var(--color-button-border-active);
  background-color: var(--color-button-background-hover);
  }

  sl-button::part(base):active {
  color: black;
  border-color: var(--color-button-border-active);
  background-color: var(--color-button-background-active);
  }

    sl-button span {
      // opacity: 0.6;
    }
    .cm-s-neo .CodeMirror-cursor {
      // border-left: 1px solid red;
      background: transparent;
    }

    small {
      position: absolute;
      left: 0;
      bottom: 0;
      opacity: 0.6;
      font-size: 12px;
      font-style: italic;
      margin: calc(var(--padding) * 2);
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
    this.startWorker();

    const html = document.getElementsByTagName('html')[0];
    this.observer = new MutationObserver((mutations) => mutations.forEach(() => {
      this.mode = html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }));
    this.observer.observe(html, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  startWorker = () => {
    this.worker.port.start();
    this.worker.port.addEventListener('message', e => {
      const { type, data, threadID } = JSON.parse(e.data);
      if (type === 'log' || type === 'error') {
        if (threadID === this.threadID) {
          this.output.push(data.length === 1 ? data[0] : data);
          // Because we are mutating output
          this.requestUpdate();
        }
      } else if (type === 'worker-log') {
        console.log(...data);
      } else if (type === 'worker-error') {
        console.error(...data);
      } else if (type === 'complete' && threadID === this.threadID) {
        this.running = false;
      }
    });

  }

  @state()
  protected mode?: 'light' | 'dark';

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer.disconnect();
  }

  observer: MutationObserver;

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

  @state()
  protected threadID = '';

  execute = async () => {
    if (this.running) {
      this.running = false;
      this.worker.port.postMessage({
        threadID: this.threadID,
        type: 'abort',
      });
      this.threadID = '';
    } else {
      this.running = true;
      this.output = [];
      this.threadID = `${Math.random()}`;
      this.worker.port.postMessage({
        threadID: this.threadID,
        type: 'start',
        root: window.location.origin,
        script: this.ref.value?.script,
      });
    }
  }

  @state()
  protected hover = false;

  mouseover = () => {
    if (this.running) {
      this.hover = true;
    }
  }
  mouseout = () => {
    this.hover = false;
  }

  ref: Ref<CodeEditorCodeMirror> = createRef();

  protected render() {
    return html`
      <div id="container" @keydown=${this.handleKeydown}>
      <div id="codemirror-container">
        <code-editor-wc-codemirror
          theme="${this.mode}"
          ${ref(this.ref)}
        >
          <slot></slot>
        </code-editor-wc-codemirror>
        </div>
        <div id="output" class="${this.output.length || this.running ? 'active' : ''}">
        <form @submit=${this.handleSubmit}>
        <sl-button 
          type="submit"
          variant="default" 
          id="run" 
          @mouseover=${this.mouseover}
          @mouseout=${this.mouseout}
        >${this.running ? html`Abort` : html`Run <span>(⌘+⏎)</span>`}</sl-button>
        <small>All code snippets are editable</small>
        </form>
        ${this.output.length ? html`
          <div id="output-inner" >
          <div class="chat-bubble" >
          ${this.output.map((output) => {
      // <json-viewer .data=${output}></json-viewer>
      if (typeof output === 'object') {
        return html`
            ${JSON.stringify(output)}
          `;
      }
      return html`
            ${output}
          `;
    })}
          </div>
          </div>
          ` : this.running ? html`
          <div id="output-inner" >
          <div class="chat-bubble" >
          <sl-button id="loading" loading></sl-button>
          </div>
          </div>
          ` : html``}

        </div>
        </div>
      `;

  }
}
