import {
  getFrontmatter,
} from "./get-frontmatter.js";
import {
  getValue,
} from "./get-value.js";
import type {
  Frontmatter,
  Value,
} from "./types.js";


export class GBNFRule {
  parts: Value[] = [];
  frontmatter: Frontmatter = {};
  constructor(strings: TemplateStringsArray | string[], values: Value[]) {
    for (let i = 0; i < strings.length; i++) {
      let curStr = strings[i];
      if (i === 0) {
        // this might have frontmatter
        const str = curStr.trim();
        if (str.startsWith('---')) {
          const parts = str.split('---');
          this.frontmatter = getFrontmatter(parts[1]);
          curStr = curStr.split('---').slice(2).join('---');
        }
      }
      for (const str of curStr.split(/[ \n\t\r]+/)) {
        this.parts.push(str);
      }
      this.parts.push(values[i]);
    }
  }

  toString(): string {
    const { frontmatter, parts, } = this;
    const _getValue = getValue(frontmatter);
    const gbnf = parts.filter(Boolean).map(_getValue).join(' ');
    return `(${gbnf})`;
  }
}

export class OptRule extends GBNFRule {
  toString() {
    const gbnf = super.toString();
    return `${gbnf}?`;
  }
}

export class AnyRule extends GBNFRule {
  toString() {
    const gbnf = `(${super.toString()})`;
    return gbnf;
  }
}
