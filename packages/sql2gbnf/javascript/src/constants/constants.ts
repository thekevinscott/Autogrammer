import {
  stringDef,
  numberDef,
  boolDef,
  nullDef,
  charDef,
  integerDef,
} from './grammar-definitions.js';
import {
  STRING_KEY,
  NUMBER_KEY,
  BOOLEAN_KEY,
  NULL_KEY,
  CHAR_KEY,
  INTEGER_KEY,
  COMMA_KEY,
  DOUBLE_QUOTE_KEY,
  LEFT_PAREN_KEY,
  RIGHT_PAREN_KEY,
  SEMI_KEY,
  SINGLE_QUOTE_KEY,
} from './grammar-keys.js';

export const GLOBAL_CONSTANTS = [
  `${STRING_KEY} ::= ${stringDef}`,
  `${NUMBER_KEY} ::= ${numberDef}`,
  `${BOOLEAN_KEY} ::= ${boolDef}`,
  `${NULL_KEY} ::= ${nullDef}`,
  `${CHAR_KEY} ::= ${charDef}`,
  `${INTEGER_KEY} ::= ${integerDef}`,
  `${COMMA_KEY} ::= ","`,
  `${DOUBLE_QUOTE_KEY} ::= "\\""`,
  `${SINGLE_QUOTE_KEY} ::= "'"`,
  `${LEFT_PAREN_KEY} ::= "("`,
  `${RIGHT_PAREN_KEY} ::= ")"`,
  `${SEMI_KEY} ::= ";"`,
];
