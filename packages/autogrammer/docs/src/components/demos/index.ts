import { define } from "../../utils/define.js";
import { AutogrammerDemos } from "./demos.js";
import { AutogrammerDemo } from "./demo.js";

define(AutogrammerDemos);
define(AutogrammerDemo);

declare global {
  interface HTMLElementTagNameMap {
    'autogrammer-demos': AutogrammerDemo;
  }
}

