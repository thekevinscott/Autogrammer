import { replace, } from './replace.js';
import _stringDef from '../grammar-definitions/string.gbnf?raw' assert { type: 'text' };
import _integerDef from '../grammar-definitions/integer.gbnf?raw' assert { type: 'text' };
import _numberDef from '../grammar-definitions/number.gbnf?raw' assert { type: 'text' };
import _nullDef from '../grammar-definitions/null.gbnf?raw' assert { type: 'text' };
import _boolDef from '../grammar-definitions/boolean.gbnf?raw' assert { type: 'text' };
import _charDef from '../grammar-definitions/char.gbnf?raw' assert { type: 'text' };
import _whitespaceDef from '../grammar-definitions/whitespace.gbnf?raw' assert { type: 'text' };
import _whitespaceRepeatingDef from '../grammar-definitions/whitespace-repeating.gbnf?raw' assert { type: 'text' };

export const numberDef = replace(_numberDef);
export const integerDef = replace(_integerDef);
export const stringDef = replace(_stringDef);
export const boolDef = replace(_boolDef);
export const nullDef = replace(_nullDef);
export const charDef = replace(_charDef);
export const whitespaceDef = replace(_whitespaceDef);
export const whitespaceRepeatingDef = replace(_whitespaceRepeatingDef);
