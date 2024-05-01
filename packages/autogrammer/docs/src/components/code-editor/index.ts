import { define } from "../../utils/define.js";
import { CodeEditor } from "./code-editor.js";

define(CodeEditor);

declare global {
  interface HTMLElementTagNameMap {
    'code-editor': CodeEditor;
  }
}
