import {
  SUPPORTED_SYNTAXES,
} from "./constants.js";
import {
  SupportedSyntax,
} from "./types.js";

export const isSupportedSyntax = (syntax: string): syntax is SupportedSyntax => SUPPORTED_SYNTAXES.includes(syntax);
