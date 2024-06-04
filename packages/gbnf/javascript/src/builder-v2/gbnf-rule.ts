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
  wrapped?: string;
}

export class GBNFRule {
  raw: boolean;
  name?: string;
  wrapped?: string;
  constructor(
    protected strings: TemplateStringsArray,
    protected values: Value[],
    {
      raw,
      name,
      wrapped,
    }: Opts
  ) {
    this.raw = raw;
    this.name = name;
    this.wrapped = wrapped;
  }

  compile = ({ caseKind = 'default', }: {
    caseKind?: CaseKind;
  } = {}, parser = new GrammarBuilder()) => {
    this.addToParser(parser, caseKind);
    return joinWith('\n',
      ...[...parser.grammar,].sort(),
    );
  };

  wrap = (wrapped = '') => {
    return new GBNFRule(this.strings, this.values, {
      raw: this.raw,
      name: this.name,
      wrapped,
    });
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

    let gbnf = join(...strings.reduce<(string | undefined)[]>((acc, string, i) => acc.concat([
      raw ? getRawValue(string) : getStringValue(string, caseKind),
      ruleNames[i],
    ]), []).filter(Boolean));

    if (this.wrapped !== undefined) {
      gbnf = `(${gbnf})${this.wrapped}`;
    }

    return parser.addRule(gbnf, !leaf ? 'root' : name);
  };
}
