import {
  type GBNFRule,
} from './gbnf-rule.js';
export type Value = string | GBNFRule | undefined;

export interface Frontmatter {
  raw?: boolean;
}
