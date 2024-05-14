import { join, } from '../utils/join.js';
import {
  whitespaceDef,
  whitespaceRepeatingDef,
} from './grammar-definitions.js';
import {
  WHITESPACE_KEY,
  WHITESPACE_REPEATING_KEY,
} from './grammar-keys.js';

export const GLOBAL_CONSTANTS = [
  join(WHITESPACE_KEY, '::=', whitespaceDef),
  join(WHITESPACE_REPEATING_KEY, '::=', whitespaceRepeatingDef),
];
