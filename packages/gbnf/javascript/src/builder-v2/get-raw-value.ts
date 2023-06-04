import { isWhitespace, } from "./is-whitespace.js";

export const getRawValue = (value: string) => {
  let str = '';
  let i = 0;
  while (isWhitespace(value[i])) {
    i += 1;
  }
  let inQuote = false;
  while (i < value.length) {
    if (inQuote === false) {
      let encounteredWhitespace = false;
      while (i < value.length && isWhitespace(value[i])) {
        i += 1;
        encounteredWhitespace = true;
      }
      if (i >= value.length) {
        break;
      }
      if (encounteredWhitespace) {
        str += " ";
      }
    }
    if (value[i] === '"' && (i >= 0 && value[i - 1] !== '\\')) {
      inQuote = !inQuote;
    }
    if (value[i] === '\n') {
      str += '\\n';
    } else {
      str += value[i];
    }
    i += 1;
  }
  return str;
};
