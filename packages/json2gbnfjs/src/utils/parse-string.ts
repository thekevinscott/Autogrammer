import {
  CHAR_KEY,
  QUOTE_KEY,
  STRING_KEY,
} from "../constants/grammar-keys.js";
import { join, } from "./join.js";
import { JSONSchemaString, } from "../types.js";

export const parseString = (schema: JSONSchemaString): string => {
  const { format, pattern, minLength, maxLength, } = schema;
  if (pattern !== undefined) {
    throw new Error('pattern is not supported');
  }
  if (format !== undefined) {
    throw new Error('format is not supported');
  }

  if (minLength !== undefined && maxLength !== undefined) {
    if (minLength > maxLength) {
      throw new Error('minLength must be less than or equal to maxLength');
    }
    return join(
      QUOTE_KEY,
      Array(minLength).fill(CHAR_KEY).join(' '),
      Array(maxLength - minLength).fill(`(${CHAR_KEY})?`).join(' '),
      QUOTE_KEY,
    );
  } else if (maxLength === undefined && minLength !== undefined) {
    return join(
      QUOTE_KEY,
      Array(minLength - 1).fill(CHAR_KEY).join(' '),
      `(${CHAR_KEY})+`,
      QUOTE_KEY,
    );
  } else if (minLength === undefined && maxLength !== undefined) {
    return join(
      QUOTE_KEY,
      `${Array(maxLength).fill(`(${CHAR_KEY})?`).join(' ')}`,
      QUOTE_KEY,
    );
  }
  return STRING_KEY;
};
