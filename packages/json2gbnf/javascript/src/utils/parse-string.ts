import {
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import { JSONSchemaString, } from "../types.js";
import {
  char,
  quote,
  string,
} from "../constants.js";

export const parseString = (schema: JSONSchemaString): GBNFRule => {
  const { format, pattern, minLength, maxLength, } = schema;
  if (pattern !== undefined) {
    throw new Error('pattern is not supported');
  }
  if (format !== undefined) {
    throw new Error('format is not supported');
  }


  if (minLength && maxLength) {
    if (minLength > maxLength) {
      throw new Error('minLength must be less than or equal to maxLength');
    }
    const minChars = Array<GBNFRule>(minLength).fill(char);
    const maxChars = Array<GBNFRule>(maxLength - minLength).fill(char.wrap('?'));
    return _`
      ${quote}
      ${[...minChars, ...maxChars,]}
      ${quote}
    `;
  } else if (minLength) {
    return _`
      ${quote}
      ${Array(minLength - 1).fill(char)}
      ${char.wrap('+')}
      ${quote}
    `;
  } else if (maxLength) {
    const rule = _`
      ${quote}
      ${Array(maxLength).fill(char.wrap('?'))}
      ${quote}
    `;
    return rule;
  }
  return string;
};
