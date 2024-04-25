import Mustache from 'mustache';
import { KEYS, } from '../constants/grammar-keys.js';
export const replace = (def: unknown): string => {
  if (typeof def !== 'string') {
    throw new Error(`Expected string for ${JSON.stringify(def)}`);
  }
  return Mustache.render(def, KEYS);
};
