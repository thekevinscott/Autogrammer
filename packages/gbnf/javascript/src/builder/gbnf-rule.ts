import {
  joinWith,
} from "./join.js";
import {
  customInspectSymbol,
  type CaseKind,
  type Value,
} from "./types.js";
import { GrammarBuilder, } from "./grammar-builder.js";
import { getRawValue, } from "./get-raw-value.js";
import { getStringValue, } from "./get-string-value.js";
import { GBNF, } from "../gbnf.js";
import { isRuleChar, isRuleCharExcluded, isRuleEnd, } from "../grammar-graph/type-guards.js";
import { ParseState, } from "../grammar-graph/parse-state.js";
import { getRuleNames, } from "./get-rule-names.js";
import { getGBNF, } from "./get-gbnf.js";

interface Opts {
  raw: boolean;
  name?: string;
  wrapped?: string;
  separator?: string;
}

export class GBNFRule {
  raw: boolean;
  name?: string;
  wrapped?: string;
  separator?: string;
  constructor(
    protected strings: TemplateStringsArray,
    protected values: Value[],
    {
      raw,
      name,
      wrapped,
      separator,
    }: Opts
  ) {
    this.raw = raw;
    this.name = name;
    this.wrapped = wrapped;
    this.separator = separator;
  }

  compile = ({
    rules = [],
    caseKind = 'default',
  }: {
    caseKind?: CaseKind;
    rules?: GBNFRule[];
  } = {}, parser = new GrammarBuilder()) => {
    for (const rule of rules) {
      rule.addToParser(parser, caseKind, true);
    }
    this.addToParser(parser, caseKind);
    return joinWith('\n',
      ...[...parser.grammar,].sort(),
    );
  };

  clone = (opts: Partial<Opts>) => {
    return new GBNFRule(this.strings, this.values, {
      raw: this.raw,
      name: this.name,
      wrapped: this.wrapped,
      separator: this.separator,
      ...opts,
    });
  };

  key = (name: string) => {
    return this.clone({ name, });
  };

  wrap = (wrapped = '') => {
    return this.clone({ wrapped, });
  };

  separate = (separator: string) => {
    return this.clone({ separator, });
  };

  [customInspectSymbol]() {
    return this.compile();
  }

  log = (opts: Parameters<typeof this.compile>[0] = {}) => {
    let gbnf = this.compile(opts);
    gbnf = gbnf.replaceAll(/\((.*?)\)\*/g, '($1)? ($1)? ($1)?');
    gbnf = gbnf.replaceAll(/\((.*?)\)\+/g, '($1)  ($1)? ($1)?');
    gbnf = gbnf.replaceAll(/\[(.*?)\]\*/g, '[$1]? [$1]? [$1]?');
    gbnf = gbnf.replaceAll(/\[(.*?)\]\+/g, '[$1]  [$1]? [$1]?');
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

  getGBNF = (parser: GrammarBuilder, caseKind: CaseKind) => {
    const {
      strings,
      values,
      raw,
      separator,
    } = this;

    const ruleNames = getRuleNames(values, parser, caseKind, separator);
    let inQuote = false;
    const _strings = strings.map(string => {
      if (raw) {
        const { str, inQuote: _inQuote, } = getRawValue(string, inQuote);
        inQuote = _inQuote;
        return str;
      }
      return getStringValue(string, caseKind);
    });
    return getGBNF(ruleNames, _strings, {
      raw: this.raw,
      wrapped: this.wrapped,
      separator: this.separator,
    });
  };

  addToParser = (parser: GrammarBuilder, caseKind: CaseKind, leaf = false): string => {
    const {
      name,
    } = this;
    const gbnf = this.getGBNF(parser, caseKind);
    return parser.addRule(gbnf, !leaf ? 'root' : name);
  };
}

