import { define } from "../../utils/define.js";
import { DocSearch } from "./doc-search.js";

define(DocSearch);

declare global {
  interface HTMLElementTagNameMap {
    'doc-search': DocSearch;
  }
}

