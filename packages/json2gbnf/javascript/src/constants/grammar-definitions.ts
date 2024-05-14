import { replace, } from '../utils/replace.js';
import _arrayDef from './grammar-definitions/array.gbnf?raw' assert { type: 'text' };
import _objectDef from './grammar-definitions/object.gbnf?raw' assert { type: 'text' };
import _stringDef from './grammar-definitions/string.gbnf?raw' assert { type: 'text' };
import _integerDef from './grammar-definitions/integer.gbnf?raw' assert { type: 'text' };
import _numberDef from './grammar-definitions/number.gbnf?raw' assert { type: 'text' };
import _nullDef from './grammar-definitions/null.gbnf?raw' assert { type: 'text' };
import _boolDef from './grammar-definitions/boolean.gbnf?raw' assert { type: 'text' };
import _charDef from './grammar-definitions/char.gbnf?raw' assert { type: 'text' };

export const arrayDef = replace(_arrayDef);
export const objectDef = replace(_objectDef);
export const numberDef = replace(_numberDef);
export const integerDef = replace(_integerDef);
export const stringDef = replace(_stringDef);
export const boolDef = replace(_boolDef);
export const nullDef = replace(_nullDef);
export const charDef = replace(_charDef);
