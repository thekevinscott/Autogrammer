import { GLOBAL_CONSTANTS, } from "../constants/constants.js";
import { join, } from "./join.js";

export function* buildGrammar(entries: IterableIterator<[string, string]>, includeGlobals = false): IterableIterator<string> {
  for (const [rule, key,] of entries) {
    if (key === '') {
      throw new Error('Key cannot be an empty string');
    }

    if (rule === '') {
      throw new Error('Rule cannot be an empty string');
    }
    yield join(
      key,
      '::=',
      rule,
    );
  }
  if (includeGlobals) {
    yield* GLOBAL_CONSTANTS;
  }
};
