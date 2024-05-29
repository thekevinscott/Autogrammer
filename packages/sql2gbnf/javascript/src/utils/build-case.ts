import { join, } from "gbnf/builder";
import { CaseKind, } from "../types.js";
import { any, } from "./any.js";
import { rule, } from "./get-rule.js";

const isAlpha = (char: string) => /^[a-zA-Z]$/.test(char);

export const buildCase = (
  caseKind: CaseKind,
  ...words: string[]
): string => {
  const casedWords = words.map(buildCasedWord(caseKind));
  // if (casedWords.length === 1) {
  //   return join(casedWords);
  // }
  return any(...casedWords);
};

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
