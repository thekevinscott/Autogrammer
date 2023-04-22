/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import _arrayDef from './array.gbnf?raw';
import _objectDef from './object.gbnf?raw';
import _stringDef from './string.gbnf?raw';
import _integerDef from './integer.gbnf?raw';
import _numberDef from './number.gbnf?raw';
import _nullDef from './null.gbnf?raw';
import _boolDef from './boolean.gbnf?raw';
import _charDef from './char.gbnf?raw';

export const arrayDef: string = _arrayDef.trim();
export const objectDef: string = _objectDef.trim();
export const numberDef: string = _numberDef.trim();
export const integerDef: string = _integerDef.trim();
export const stringDef: string = _stringDef.trim();
export const boolDef: string = _boolDef.trim();
export const nullDef: string = _nullDef.trim();
export const charDef: string = _charDef.trim();
