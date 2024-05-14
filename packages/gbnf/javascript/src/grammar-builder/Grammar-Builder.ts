import { getID, } from './utils/get-id.js';
import type {
  AddRule,
  GetConst,
  SchemaOpts,
} from './types.js';
import { buildGrammar, } from './utils/build-grammar.js';
import { getConstKey, } from './utils/get-const-key.js';
import { getConstRule, } from './utils/get-const-rule.js';

export class GrammarBuilder {
  #numberOfRulesWithoutKey = 0;
  #rules = new Map<string, string>();
  // whitespace can be Infinity or an integer greater than or equal to 0.
  public whitespace: number;

  constructor({ whitespace = 1, }: SchemaOpts = {}) {
    if (whitespace < 0) {
      throw new Error('Whitespace must be greater than or equal to 0. It can also be Infinity.');
    }
    this.whitespace = whitespace;
  }

  public getConst: GetConst = (
    key: string,
    {
      left = true,
      right = true,
    } = {}
  ) => this.whitespace !== 0 ? this.addRule(
    getConstRule(this, key, left, right),
    getConstKey(key, left, right),
  ) : key;

  public addRule: AddRule = (
    rule,
    key,
  ) => {
    const symbolId = key ? key : (this.#rules.get(rule) ?? `x${getID(this.#numberOfRulesWithoutKey++)}`);
    this.#rules.set(rule, symbolId);
    return symbolId;
  };

  public get grammar(): string[] {
    return buildGrammar(this.#rules.entries());
  }
}
