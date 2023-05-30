import { GrammarParseError, } from "../utils/errors.js";

export const PARSE_NAME_ERROR = 'Failed to find a valid name';
export const INVALID_NAME_CHAR = (char: string) => `Invalid char was encountered: "${char}"`;

const VALID_NAME_SEPARATORS = [
  '-',
];

export const parseName = (grammar: string, pos: number): string => {
  let name = '';
  while (pos < grammar.length && (/[a-z]/.test(grammar[pos]) || VALID_NAME_SEPARATORS.includes(grammar[pos]))) {
    if (name === '' && grammar[pos] === '-') {
      throw new GrammarParseError(grammar, pos, INVALID_NAME_CHAR(grammar[pos]));
    }
    name += grammar[pos];
    pos++;
  }
  if (!name) {
    throw new GrammarParseError(grammar, pos, PARSE_NAME_ERROR);
  }
  return name;
};
