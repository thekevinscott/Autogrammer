import { AddRule, } from "../builder-v1/types.js";
import { buildGrammar, } from "../builder-v1/utils/build-grammar.js";
import { getID, } from "../builder-v1/utils/get-id.js";
import { getRuleName, } from "./get-rule-name.js";

export class GrammarBuilder {
  #rules = new Map<string, string>();
  #keys = new Set();

  public addRule: AddRule = (
    rule,
    key,
  ) => {
    let symbolId = key ? key : (this.#rules.get(rule) ?? getRuleName(rule));
    if (this.#rules.has(rule) && this.#rules.get(rule) !== symbolId) {
      throw new Error(`Rule already exists: "${rule}" is already defined as "${this.#rules.get(rule)}". It cannot be redefined as "${symbolId}".`);
    }
    if (this.#keys.has(symbolId) && symbolId !== this.#rules.get(rule)) {
      let i = 0;
      let symbolIdCandidate = `${symbolId}-${getID(i)}`;
      while (this.#keys.has(symbolIdCandidate) && symbolIdCandidate !== this.#rules.get(rule)) {
        i += 1;
        symbolIdCandidate = `${symbolId}-${getID(i)}`;
      }
      symbolId = symbolIdCandidate;
    }
    this.#rules.set(rule, symbolId);
    this.#keys.add(symbolId);
    return symbolId;
  };

  public get grammar(): IterableIterator<string> {
    return buildGrammar(this.#rules.entries());
  }
}
