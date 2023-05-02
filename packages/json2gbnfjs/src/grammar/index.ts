/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import _arrayDef from './array.gbnf?raw' assert { type: 'text' };
import _objectDef from './object.gbnf?raw' assert { type: 'text' };
import _stringDef from './string.gbnf?raw' assert { type: 'text' };
import _integerDef from './integer.gbnf?raw' assert { type: 'text' };
import _numberDef from './number.gbnf?raw' assert { type: 'text' };
import _nullDef from './null.gbnf?raw' assert { type: 'text' };
import _boolDef from './boolean.gbnf?raw' assert { type: 'text' };
import _charDef from './char.gbnf?raw' assert { type: 'text' };
import _whitespaceDef from './whitespace.gbnf?raw' assert { type: 'text' };
import _whitespaceRepeatingDef from './whitespace-repeating.gbnf?raw' assert { type: 'text' };

export const VALUE_KEY = 'val';
export const OBJECT_KEY = 'obj';
export const ARRAY_KEY = 'arr';
export const STRING_KEY = 'str';
export const NUMBER_KEY = 'num';
export const BOOLEAN_KEY = 'bool';
export const NULL_KEY = 'null';
export const CHAR_KEY = 'chr';
export const INTEGER_KEY = 'int';
export const COMMA_KEY = 'comma';
export const COLON_KEY = 'colon';
export const QUOTE_KEY = 'quote';
export const LEFT_BRACKET_KEY = 'lbracket';
export const RIGHT_BRACKET_KEY = 'rbracket';
export const LEFT_BRACE_KEY = 'lbrace';
export const RIGHT_BRACE_KEY = 'rbrace';
export const WHITESPACE_KEY = 'ws';
export const WHITESPACE_REPEATING_KEY = 'wss';
const KEYS: Record<string, string> = {
  VALUE_KEY,
  OBJECT_KEY,
  ARRAY_KEY,
  STRING_KEY,
  NUMBER_KEY,
  BOOLEAN_KEY,
  NULL_KEY,
  CHAR_KEY,
  INTEGER_KEY,
  COMMA_KEY,
  COLON_KEY,
  QUOTE_KEY,
  LEFT_BRACKET_KEY,
  RIGHT_BRACKET_KEY,
  LEFT_BRACE_KEY,
  RIGHT_BRACE_KEY,
  WHITESPACE_KEY,
  WHITESPACE_REPEATING_KEY,
};

const GBNF_KEY_REPLACEMENT_PATTERN = /{{(.*?)}}/g;

const replace = (def: unknown): string => {
  if (typeof def !== 'string') {
    throw new Error(`Expected string for ${JSON.stringify(def)}`);
  }
  return def.trim().replace(GBNF_KEY_REPLACEMENT_PATTERN, (...args) => {
    const inner = args[1];
    const key = KEYS[inner];
    if (!key) {
      throw new Error(`Unknown key ${inner} for def ${def}`);
    }
    return key;
  });
};
export const arrayDef = replace(_arrayDef);
export const objectDef = replace(_objectDef);
export const numberDef = replace(_numberDef);
export const integerDef = replace(_integerDef);
export const stringDef = replace(_stringDef);
export const boolDef = replace(_boolDef);
export const nullDef = replace(_nullDef);
export const charDef = replace(_charDef);
export const whitespaceDef = replace(_whitespaceDef);
export const whitespaceRepeatingDef = replace(_whitespaceRepeatingDef);
