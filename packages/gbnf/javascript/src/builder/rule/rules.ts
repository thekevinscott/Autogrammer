import {
  AnyRule,
  GBNFRule,
  OptRule,
} from "./gbnf-rule.js";
import type {
  Value,
} from "./types.js";

export function rule(strings: TemplateStringsArray, ...values: Value[]): GBNFRule {
  return new GBNFRule(strings, values);
}

export const $ = rule;

export function _opt(strings: TemplateStringsArray, ...values: Value[]): GBNFRule {
  return new OptRule(strings, values);
}

export const $o = _opt;
export function $r(strings: TemplateStringsArray, ...values: Value[]): GBNFRule {
  return new GBNFRule([
    [
      '---',
      'raw: true',
      '---',
      strings[0],
    ].join('\n'),
    ...strings.slice(1),
  ], values);
}

export function _any(strings: TemplateStringsArray, ...values: Value[]): GBNFRule {
  return new AnyRule(strings, values);
}
