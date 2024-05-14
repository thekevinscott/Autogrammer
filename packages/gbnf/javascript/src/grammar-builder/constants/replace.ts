import { KEYS, } from '../constants/grammar-keys.js';

const GBNF_KEY_REPLACEMENT_PATTERN = /{{(.*?)}}/g;

export const replace = (def: unknown): string => {
  if (typeof def !== 'string') {
    throw new Error(`Expected string for ${JSON.stringify(def)}`);
  }
  return def.trim().replace(GBNF_KEY_REPLACEMENT_PATTERN, (_, inner: string) => {
    const key = KEYS[inner];
    if (!key) {
      throw new Error(`Unknown key ${inner} for def ${def}`);
    }
    return key;
  });
};

