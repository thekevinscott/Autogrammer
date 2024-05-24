import { LitElement, css, html } from 'lit';
import 'playground-elements/playground-project.js';
import 'playground-elements/playground-file-editor.js';
import 'playground-elements/playground-preview.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import { styleMap } from 'lit/directives/style-map.js';
import { state } from 'lit/decorators.js';

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

    playground-file-editor {
      border: 1px solid rgba(0,0,0,0.1);
      border-bottom: none;
    }
    playground-preview {
      height: 140px;
      border: 1px solid rgba(0,0,0,0.1);
      --playground-preview-toolbar-background: #eaeaea;
    }
  `;

  static readonly metadata = {
    version: '0.1.0',
    tag: TAG_NAME,
  };

  ref: Ref<HTMLScriptElement> = createRef();

  get script(): HTMLScriptElement {
    const script = this.ref.value;
    if (!script) {
      throw new Error('CodeMirror not found');
    }
    return script;
  }

  // @state()
  lineNumbers = 5;

  set script(textContent: string) {
    this.script.innerHTML = textContent;
    // TODO: Why is a state update not triggering a re-render?
    this.lineNumbers = textContent.split('\n').length;
    this.requestUpdate();
  }

  handleSlotchange(e: Event) {
    const target = e.target as HTMLSlotElement;
    const childNodes = target.assignedNodes({ flatten: true });
    this.script = childNodes.map((node) => typeof node === 'string' ? node : node.textContent ? node.textContent : '').join('');
  }

  render() {
    return html`
      <playground-project id="code-editor">
        <script type="sample/js" filename="index.js" ${ref(this.ref)}>
        </script>
        <script type="sample/js" filename="console.js" hidden>
          // const origLog = console.log;
          const output = document.getElementById('output');
          console.log = (...msgs) => {
            // origLog(...msgs);
            for (const msg of msgs) {
              output.innerText += msg;
            }
          };
        </script>
        <script type="sample/js" filename="env.js" hidden>
          import {
            pipeline,
            env,
          } from '@xenova/transformers';
          env.allowRemoteModels = true;
          env.allowLocalModels = false;
        </script>
        <script type="sample/html" filename="index.html" hidden>
          <!doctype html>
          <body>
          <pre id="output"></pre>
            <script type="module" src="./console.js">&lt;/script>
            <script type="module" src="./env.js">&lt;/script>
            <script type="module" src="./index.js">&lt;/script>
          </body>
        </script>

      </playground-project>

      <playground-file-editor
      style="${styleMap({ height: `${20 * this.lineNumbers + 10}px` })}"
      project="code-editor"
      filename="index.js"
      lineNumbers
      ></playground-file-editor>

      <playground-preview project="code-editor"> </playground-preview>

      <slot @slotchange=${this.handleSlotchange}></slot>
    `;

  }
}
