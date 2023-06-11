import {
  type GBNFRule,
  _,
} from "gbnf/builder";

export const WS = 'ws';
export const OPT_WS = 'opt-ws';
export const NR_OPT_WS = 'non-rec-opt-ws';
export const VALUE = 'value';

const baseNum = _`"-"? ${_`[0-9] | ([1-9] [0-9]*)`}`.key('base-num');
export const quote = _`"\\""`.key('quote');
export const number = _`${baseNum} ${_`"." [0-9]+`.wrap('?')} ([eE] [-+]? [0-9]+)?`.key('number');
export const integer = _`${baseNum} ${_`"." [0]+`.wrap('?')}`.key('integer');
export const boolean = _`"true" | "false"`.key('boolean');
export const nll = _`"null"`.key('null');
export const char = _`[^"']`;
// export const char = _`[^"'\\n\\r\\t]`;
export const string = _`${quote} ${char.wrap('*')} ${quote}`.key('string');
export const array = (value: GBNFRule | string = VALUE) => _`
  "[" 
  ${_`
    ${value}
    ${_`
      "," 
      ${OPT_WS}
      ${value}
    `.wrap('*')}
  `.wrap('?')}
  "]" 
`.key('array');
export const object = (value: GBNFRule | string = VALUE) => {
  const propertyKeyPair = _`
      ${string}
    ":" 
    ${OPT_WS}
    ${value}
  `.key('object-property-key-pair');
  return _`
  "{" 
  ${_`
    ${propertyKeyPair}
    ${_`
      "," 
      ${OPT_WS}
      ${propertyKeyPair}
    `.wrap('*')
      }`.wrap('?')} 
  "}"
`.key('object');
};

export const value = _`
  ${number} | ${boolean} | ${nll} | ${string} | ${array()} | ${object()}
`.key(VALUE);

