import { define } from '../utils/define.js';
import { CodeEditor } from './index.js';

define(CodeEditor);

declare global {
  interface HTMLElementTagNameMap {
    'code-editor': CodeEditor;
  }
}

