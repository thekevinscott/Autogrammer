import {
  LitElement,
  PropertyValueMap,
  css,
  html
} from 'lit';
import {
  Ref,
  createRef,
  ref
} from 'lit/directives/ref.js';
import {
  property,
  state,
} from 'lit/decorators.js';
import 'https://cdn.jsdelivr.net/npm/@vanillawc/wc-codemirror@2.1.0/index.min.js';
import 'https://cdn.jsdelivr.net/npm/@vanillawc/wc-codemirror@2.1.0/mode/javascript/javascript.js';
import '@alenaksu/json-viewer';
import { emit } from '../../utils/event.js';

export const TAG_NAME = 'code-editor-wc-codemirror';

interface WCCodeMirror extends HTMLElement {
  value: string;
  editor: any;
}

export class CodeEditorCodeMirror extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    wc-codemirror {
      // border: 1px solid var(--color-code-editor-border-color);
      // border-bottom: 3px solid var(--color-code-editor-border-color);
      border-radius: 4px 4px 0 0;
      overflow: hidden;
      max-height: 800px;
      overflow: scroll;
    }
    .cm-s-neo .CodeMirror-cursor {
      // border-left: 1px solid red;
      background: transparent;
    }
  `;

  static readonly metadata = {
    version: '0.1.0',
    tag: TAG_NAME,
  };

  ref: Ref<WCCodeMirror> = createRef();

  @property({ type: String, })
  script = '';

  get codeMirror(): WCCodeMirror {
    const codeMirror = this.ref.value;
    if (!codeMirror) {
      throw new Error('CodeMirror not found');
    }
    return codeMirror;
  }

  handleSlotchange(e: Event) {
    const target = e.target as HTMLSlotElement;
    const childNodes = target.assignedNodes({ flatten: true });
    const textContents = childNodes.map((node) => typeof node === 'string' ? node : node.textContent ? node.textContent : '');
    // this.script = textContents.filter(r => r.trim()).join('');
    this.script = textContents.map((r, i) => {
      if (i === 0 || i === textContents.length - 1) {
        return Array(r.split('\n').length - 1).fill('').join('\n')
      }

      return r;
    }).join('');
    this.codeMirror.value = this.script;
  }

  // protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
  //   if (_changedProperties.has('script')) {
  //     this.codeMirror.value = this.script;
  //   }
  // }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    const { codeMirror } = this;
    // console.log(_changedProperties)
    // codeMirror.value = this.script;
    const editor = codeMirror.editor;
    editor.keyMap = 'vim';
    editor.on('change', () => {
      const value = editor.getValue();
      this.script = value;
      emit(this, 'change', { value });
    });
  }

  @property({ type: String })
  theme?: string;

  protected render() {
    // const theme = this.theme === undefined ? '' : this.theme === 'light' ? 'neo' : 'seti';
    const theme = 'seti';
    return html`
      <wc-codemirror 
        mode="javascript" 
        theme="${theme}" 
        ${ref(this.ref)}
      >
        <!-- <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vanillawc/wc-codemirror/theme/neo.css"> -->
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@vanillawc/wc-codemirror/theme/seti.css">
      </wc-codemirror>
      <slot @slotchange=${this.handleSlotchange}></slot>
    `;
  }
}

