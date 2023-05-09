import { define } from './define.js';
import { CodeCell } from './code-cell/index.js';

define(CodeCell);

declare global {
  interface HTMLElementTagNameMap {
    'code-editor': CodeCell;
  }
}

