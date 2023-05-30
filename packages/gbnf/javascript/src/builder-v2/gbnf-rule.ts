import {
  join,
  joinWith,
} from "../builder-v1/utils/join.js";
import type {
  CaseKind,
  Value,
} from "./types.js";
import { GrammarBuilder, } from "./grammar-builder.js";
import { getRawValue, } from "./get-raw-value.js";
import { getStringValue, } from "./get-string-value.js";

interface Opts {
  raw: boolean;
  name?: string;
}

export class GBNFRule {
  raw: boolean;
  name?: string;
  constructor(
    protected strings: TemplateStringsArray,
    protected values: Value[],
    {
      raw,
      name,
    }: Opts
  ) {
    this.raw = raw;
    this.name = name;
  }

  compile = ({ caseKind = 'default', }: {
    caseKind?: CaseKind;
  } = {}, parser = new GrammarBuilder()) => {
    this.addToParser(parser, caseKind);
    return joinWith('\n',
      ...[...parser.grammar,].sort(),
    );
  };

  addToParser = (parser: GrammarBuilder, caseKind: CaseKind, leaf = false): string => {
    const {
      strings,
      values,
      name,
      raw,
    } = this;

    // first, get rule names for each value
    const ruleNames = values.map((value) => value instanceof GBNFRule ? value.addToParser(parser, caseKind, true) : value);

    const gbnf = join(...strings.reduce<(string | undefined)[]>((acc, string, i) => acc.concat([
      raw ? getRawValue(string) : getStringValue(string, caseKind),
      ruleNames[i],
    ]), []).filter(Boolean));

    return parser.addRule(gbnf, !leaf ? 'root' : name);
  };
}
