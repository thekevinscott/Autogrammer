import { define } from "../../utils/define.js";
import { CodeEditor } from "./code-editor.js";
import { CodeEditorCodeMirror } from "./code-mirror.js";

define(CodeEditor);
define(CodeEditorCodeMirror);

declare global {
  interface HTMLElementTagNameMap {
    'code-editor': CodeEditor;
    'code-editor-wc-codemirror': CodeEditorCodeMirror;
  }
}
