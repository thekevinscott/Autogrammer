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
import '@vanillawc/wc-codemirror';
// import '@vanillawc/wc-codemirror/theme/monokai.css';
import '@vanillawc/wc-codemirror/mode/javascript/javascript.js';

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
    }

    wc-codemirror {
      border: 1px solid rgba(0,0,0,0.1);
      border-radius: 4px 4px 0 0;
      overflow: hidden;
      min-height: 100px;
      max-height: 315px;
      overflow: scroll;
    }
    #output {
      border: 1px solid rgba(0,0,0,0.1);
      border-top: none;
      border-radius: 0 0 4px 4px;
      overflow: hidden;
      height: 140px;
      background-color: rgba(0,0,0,0.03);
      font-family: monospace;
      position: relative;
    }

    button#run {
      position: absolute;
      right: 0;
      margin-top: -40px;
      height: 40px;
      width: 80px;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2;
      border: none;
      cursor: pointer;
    }
  `;

  static readonly metadata = {
    version: '0.1.0',
    tag: TAG_NAME,
  };

  ref: Ref<WCCodeMirror> = createRef();
  output: Ref<HTMLPreElement> = createRef();

  get script(): WCCodeMirror {
    const script = this.ref.value;
    if (!script) {
      throw new Error('CodeMirror not found');
    }
    return script;
  }

  // worker = new SharedWorker('/.js/components/code-editor/worker.js', {
  //   type: 'module'
  // });

  // constructor() {
  //   super();
  //   this.worker.port.start();
  //   this.worker.port.addEventListener('message', e => {
  //     const data = JSON.parse(e.data);
  //     if (data.type === 'log') {
  //       console.log(...data.data);
  //     } else if (data.type === 'result') {
  //       console.log(data.data);
  //     }
  //   });
  // }


  @state()
  lineNumbers = 5;

  set script(textContent: string) {
    this.script.value = textContent;
    // TODO: Why is a state update not triggering a re-render?
    this.lineNumbers = textContent.split('\n').length;
    this.requestUpdate();
  }

  handleSlotchange(e: Event) {
    const target = e.target as HTMLSlotElement;
    const childNodes = target.assignedNodes({ flatten: true });
    this.script = childNodes.map((node) => typeof node === 'string' ? node : node.textContent ? node.textContent : '').join('');
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

  async execute() {
    const output = this.output.value as HTMLPreElement;
    const result = await liveExecute(this.script.value);
    output.innerText = result;
  }

  protected render() {
    return html`
    <div id="container" @keydown=${this.handleKeydown}>
    <div id="codemirror-container">

      <wc-codemirror
      mode="javascript"
      theme="neo"
        ${ref(this.ref)}

      >
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vanillawc/wc-codemirror/theme/neo.css">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vanillawc/wc-codemirror/theme/seti.css">

      </wc-codemirror>
      </div>
      <form @submit=${this.handleSubmit}>
      <button id="run">Go(⌘+⏎)</button>
      </form>
      <div id="output"         ${ref(this.output)}>
      </div>
      </div>
      <slot @slotchange=${this.handleSlotchange}></slot>
    `;

  }
}
