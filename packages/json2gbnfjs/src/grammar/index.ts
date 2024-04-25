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
import { KEYS, } from './keys.js';

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
export * from './keys.js';
