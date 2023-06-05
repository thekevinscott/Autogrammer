import { define } from "../../utils/define.js";
import { ThemeToggle } from "./theme-toggle.js";

define(ThemeToggle);

declare global {
  interface HTMLElementTagNameMap {
    'theme-toggle': ThemeToggle;
  }
}

