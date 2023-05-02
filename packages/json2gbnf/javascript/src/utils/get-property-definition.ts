import {
  QUOTE_KEY,
  VALUE_KEY,
} from "../constants/grammar-keys.js";
import { join, } from "./join.js";

// export const OBJECT_KEY_DEF = `([^\\"])+`;
export const OBJECT_KEY_DEF = `([a-zA-Z0-9])+`;

export const getPropertyDefinition = (SEPARATOR: string, COLON: string): string => {
  const PROP = [
    SEPARATOR,
    QUOTE_KEY,
    OBJECT_KEY_DEF,
    QUOTE_KEY,
    COLON,
    VALUE_KEY,
  ];
  return `(${join(
    ...PROP,
    `(${join(...PROP,)})*`,
  )})?`;
};
