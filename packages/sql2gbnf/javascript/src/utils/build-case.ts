import { join, joinPipe, } from "gbnf";
import { CaseKind, } from "../types.js";

const isAlpha = (char: string) => /^[a-zA-Z]$/.test(char);

export const buildCase = (
  caseKind: CaseKind,
  ...strs: string[]
): string => joinPipe(
  ...strs.reduce<string[]>((
    acc,
    str,
  ) => acc.concat(`${join(
    ...str.split('').map(getCase(caseKind))
  )}`), [])
);

const getCase = (caseKind: CaseKind) => (char: string) => {
  if (caseKind === 'any') {
    return isAlpha(char) ? `[${char.toLowerCase()}${char.toUpperCase()}]` : `"${char}"`;
  } else if (caseKind === 'lower') {
    return `"${char.toLowerCase()}"`;
  } else if (caseKind === 'upper') {
    return `"${char.toUpperCase()}"`;
  }
};
