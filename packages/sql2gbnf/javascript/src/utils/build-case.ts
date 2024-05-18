import { join, } from "gbnf";
import { CaseKind, } from "../types.js";
import { any, } from "./any.js";
import { rule, } from "../select/get-rule.js";

const isAlpha = (char: string) => /^[a-zA-Z]$/.test(char);

export const buildCase = (
  caseKind: CaseKind,
  ...words: string[]
): string => any(...words.map(buildCasedWord(caseKind)));

const buildCasedWord = (caseKind: CaseKind) => (word: string): string => rule(join(...word.split('').map(getCasedChar(caseKind))));

const getCasedChar = (caseKind: CaseKind) => (char: string) => {
  if (caseKind === 'any') {
    return isAlpha(char) ? `[${char.toLowerCase()}${char.toUpperCase()}]` : `"${char}"`;
  } else if (caseKind === 'lower') {
    return `"${char.toLowerCase()}"`;
  } else if (caseKind === 'upper') {
    return `"${char.toUpperCase()}"`;
  }
};
