import { getID, } from './utils/get-id.js';
import type {
  AddRule,
  GetConst,
  SchemaOpts,
} from './types.js';
import { buildGrammar, } from './utils/build-grammar.js';
import { getConstKey, } from './utils/get-const-key.js';
import { getConstRule, } from './utils/get-const-rule.js';

export class SchemaParser {
  #rules = new Map<string, string>();
  fixedOrder: boolean;
  // whitespace can be Infinity or an integer greater than or equal to 0.
  whitespace: number;

  constructor({ whitespace = 0, fixedOrder = false, }: SchemaOpts = {}) {
    if (whitespace < 0) {
      throw new Error('Whitespace must be greater than or equal to 0. It can also be infinity.');
    }
    this.whitespace = whitespace;
    this.fixedOrder = fixedOrder;
  }

  getConst: GetConst = (
    key: string,
    {
      left = true,
      right = true,
    } = {}
  ) => this.whitespace !== 0 ? this.addRule(
    getConstRule(this, key, left, right),
    getConstKey(key, left, right),
  ) : key;

  addRule: AddRule = (
    rule,
    key,
  ) => {
    const symbolId = key ? key : (this.#rules.get(rule) ?? `x${getID(this.#rules.size)}`);
    this.#rules.set(rule, symbolId);
    return symbolId;
  };

  get grammar(): string {
    return buildGrammar(this.#rules.entries());
  }
}
