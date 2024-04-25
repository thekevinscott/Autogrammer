import { GLOBAL_CONSTANTS, } from "../constants/constants.js";
import { joinWith, } from "./join.js";

export const buildGrammar = (entries: IterableIterator<[string, string]>): string => {
  const rules: string[] = [];
  for (const [rule, key,] of entries) {
    if (key === '') {
      throw new Error('Key cannot be an empty string');
    }

    if (rule === '') {
      throw new Error('Rule cannot be an empty string');
    }
    rules.push(`${key} ::= ${rule}`);
  }
  return joinWith('\n',
    ...rules,
    ...GLOBAL_CONSTANTS,
  );
};
