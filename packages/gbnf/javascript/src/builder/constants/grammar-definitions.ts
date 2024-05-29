import { replace, } from './replace.js';
import _whitespaceDef from './grammar-definitions/whitespace.gbnf?raw' assert { type: 'text' };
import _whitespaceRepeatingDef from './grammar-definitions/whitespace-repeating.gbnf?raw' assert { type: 'text' };

export const whitespaceDef = replace(_whitespaceDef);
export const whitespaceRepeatingDef = replace(_whitespaceRepeatingDef);
