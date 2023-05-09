import { LitElement, PropertyValueMap, css, html } from 'lit';
import { property, state } from 'lit/decorators.js';
import { Ref, createRef, ref } from 'lit/directives/ref.js';
import '@vanillawc/wc-codemirror';

export const TAG_NAME = 'code-editor';

interface WCCodeMirror extends HTMLElement {
  value: string;
  editor: any;
}

export class CodeCell extends LitElement {
  // Define scoped styles right with your component, in plain CSS
  static styles = css`
    slot {
      display: none;
    }

    wc-codemirror {
      border: 1px solid rgba(0, 0, 0, 0.2);
      border-radius: 4px;
      overflow: hidden;
    }

    form {
      position: relative;
      display: flex;
      flex-direction: column;

      button[type="submit"] {
        position: absolute;
        bottom: 1px;
        right: 1px;
        border: none;
        border-radius: 4px 0 0 0;
        border-top: 1px solid rgba(0, 0, 0, 0.2);
        border-left: 1px solid rgba(0, 0, 0, 0.2);
        padding: 10px 20px;
        font-size: 1rem;
        cursor: pointer;
        z-index: 10;

        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */

        &:hover {
          background-color: var(--color-primary-blue);
          color: white;
        }
      }
    }
  `;

  static readonly metadata = {
    version: '0.1.0',
    tag: TAG_NAME,
  };

  ref: Ref<WCCodeMirror> = createRef();

  get script(): WCCodeMirror {
    const script = this.ref.value;
    if (!script) {
      throw new Error('CodeMirror not found');
    }
    return script;
  }

  set script(value: string) {
    this.script.value = value;
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    console.log(this.script.editor)
  }

  handleSlotchange(e: Event) {
    const target = e.target as HTMLSlotElement;
    const childNodes = target.assignedNodes({ flatten: true });
    this.script = childNodes.map((node) => typeof node === 'string' ? node : node.textContent ? node.textContent : '').join('');
  }

  submit = async (e: Event) => {
    e.preventDefault();
    const script = this.script.value;
    const builtScript = `
    (async (grammer) => {
      ${script}
    })(window['autogrammer']);
    `;
    console.log(builtScript);
    eval(builtScript);
  };

  // Render the UI as a function of component state
  render() {
    return html`
    <form @submit=${this.submit}>
      <wc-codemirror ${ref(this.ref)} mode="javascript">
      </wc-codemirror>
      <slot @slotchange=${this.handleSlotchange}></slot>
      <button type="submit">Run</button>
    </form>
    `;

  }
}

