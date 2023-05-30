import { GrammarParseError, } from "../utils/errors.js";
import { isWordChar, } from "./is-word-char.js";

export const PARSE_NAME_ERROR = 'Failed to find a valid name';

export const parseName = (grammar: string, pos: number): string => {
  let name = '';
  while (pos < grammar.length && (isWordChar(grammar[pos]) || grammar[pos] === '-')) {
    name += grammar[pos];
    pos++;
  }
  if (!name) {
    throw new GrammarParseError(grammar, pos, PARSE_NAME_ERROR);
  }
  return name;
};
