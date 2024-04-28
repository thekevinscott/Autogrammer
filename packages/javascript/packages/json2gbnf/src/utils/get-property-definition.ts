import { COLON_KEY, QUOTE_KEY, STRING_KEY, VALUE_KEY, } from "../constants/grammar-keys.js";
import { join, } from "./join.js";

export const getPropertyDefinition = (SEPARATOR: string): string => {
  const PROP = [
    SEPARATOR,
    QUOTE_KEY,
    STRING_KEY,
    QUOTE_KEY,
    COLON_KEY,
    VALUE_KEY,
  ];
  return `(${join(
    ...PROP,
    `(${join(...PROP,)})*`,
  )})?`;
};
