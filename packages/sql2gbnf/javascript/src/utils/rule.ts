type Value = string | GBNFRule | undefined;

const frontmatterKeys = ['raw',];
interface Frontmatter {
  raw?: boolean;
}
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
          this.frontmatter = parts[1].trim().split('\n').map(l => l.trim().split(':')).reduce((acc, [key, val,]) => {
            if (!frontmatterKeys.includes(key.trim())) {
              throw new Error(`Invalid frontmatter key: ${key}`);
            }
            return {
              ...acc,
              [key.trim()]: val.trim(),
            };
          }, {});
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

const getValue = ({ raw, }: Frontmatter) => (value: Value): string => {
  if (value instanceof GBNFRule) {
    return value.toString();
  }
  if (raw || value?.startsWith('\\') || value === '"\\\\x20"') {
    return value || '';
  }
  return `"${value}"`;
};

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

export function rule(strings: TemplateStringsArray, ...values: Value[]): GBNFRule {
  return new GBNFRule(strings, values);
}

export const $ = rule;

export function _opt(strings: TemplateStringsArray, ...values: Value[]): GBNFRule {
  return new OptRule(strings, values);
}

export const $o = _opt;
export function $r(strings: TemplateStringsArray, ...values: Value[]): GBNFRule {
  return new GBNFRule([
    [
      '---',
      'raw: true',
      '---',
      strings[0],
    ].join('\n'),
    ...strings.slice(1),
  ], values);
}

export function _any(strings: TemplateStringsArray, ...values: Value[]): GBNFRule {
  return new AnyRule(strings, values);
}

// export function raw(strings: TemplateStringsArray, ...values: Value[]): Rule {
//   return new Rule(strings, values);
// }
