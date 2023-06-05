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
import { GBNF, } from "../gbnf.js";
import { isRuleChar, isRuleCharExcluded, isRuleEnd, } from "../grammar-graph/type-guards.js";
import { ParseState, } from "../grammar-graph/parse-state.js";

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

  key = (name: string) => {
    this.name = name;
    return this;
  };

  wrap = (wrapped = '') => {
    return new GBNFRule(this.strings, this.values, {
      raw: this.raw,
      name: this.name,
      wrapped,
    });
  };

  log = (opts: Parameters<typeof this.compile>[0] = {}) => {
    let gbnf = this.compile(opts);
    gbnf = gbnf.replaceAll(/\((.*?)\)\*/g, '($1)? ($1)? ($1)?');
    gbnf = gbnf.replaceAll(/\((.*?)\)\+/g, '($1) ($1)? ($1)?');
    class Node {
      char: string;
      terminal = false;
      children: Node[] = [];

      constructor(char = '') {
        this.char = char;
      }
    }
    const parseState = GBNF(gbnf);
    const rootNode = new Node('');

    function traverseParseState(currentNode: Node, parseState: ParseState) {
      for (const rule of parseState) {
        if (isRuleChar(rule)) {
          for (const value of rule.value) {
            const char = Array.isArray(value) ? 'x' : String.fromCodePoint(value);
            const nextNode = new Node(char);
            currentNode.children.push(nextNode);
            traverseParseState(nextNode, parseState.add(Array.isArray(value) ? String.fromCodePoint(value[0]) : char));
          }
        } else if (isRuleCharExcluded(rule)) {
          for (const value of rule.value) {
            const char = Array.isArray(value) ? '^' : String.fromCodePoint(value);
            const nextNode = new Node(char);
            currentNode.children.push(nextNode);
            traverseParseState(nextNode, parseState.add(Array.isArray(value) ? String.fromCodePoint(value[0] - 1) : char));
          }
        } else if (isRuleEnd(rule)) {
          currentNode.terminal = true;
        }
      }
    }

    traverseParseState(rootNode, parseState);

    const result = new Set<string>();
    function traverse(node: Node, path = '') {
      if (node.terminal) {
        result.add(path);
      }
      for (const child of node.children) {
        traverse(child, path + child.char);
      }
    }
    traverse(rootNode);
    return [...result,].join('\n');
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
