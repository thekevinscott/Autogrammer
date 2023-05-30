import {
  type GBNFRule,
} from './gbnf-rule.js';
export type Value = string | GBNFRule | undefined;

export interface Frontmatter {
  raw?: boolean;
}

export type CaseKind = 'lower' | 'upper' | 'any' | 'default';
