import { GBNFRule, } from "./gbnf-rule.js";
import type {
  Frontmatter,
  Value,
} from "./types.js";

export const getValue = ({ raw, }: Frontmatter) => (value: Value): string => {
  if (value instanceof GBNFRule) {
    return value.toString();
  }
  if (raw || value?.startsWith('\\') || value === '"\\\\x20"') {
    return value || '';
  }
  return `"${value}"`;
};

