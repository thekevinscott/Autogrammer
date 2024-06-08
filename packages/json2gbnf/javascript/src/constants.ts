import {
  _,
} from "gbnf/builder";

const baseNum = _`"-"? ${_`[0-9] | ([1-9] [0-9]*)`}`;
export const quote = _`"\\""`;
export const number = _`${baseNum} ${_`"." [0-9]+`.wrap('?')} ([eE] [-+]? [0-9]+)?`;
export const integer = _`${baseNum} ${_`"." [0]+`.wrap('?')}`;
export const boolean = _`"true" | "false"`;
export const nll = _`"null"`;
export const char = _`[^"']`;
// export const char = _`[^"'\\n\\r\\t]`;
export const string = _`${quote} ${char.wrap('*')} ${quote}`;
export const array = _`
  "[" 
  ${_`
    value 
    ${_`
      "," 
      value
    `.wrap('*')}
  `.wrap('?')}
  "]" 
`;
export const object = _`
  "{" 
  ${_`
    ${string}
    ":" 
    value 
    ${_`
      "," 
      ${string}
      ":" 
      value
    `.wrap('*')
    }`.wrap('?')} 
  "}"
`;

export const value = _`
  ${number} | ${boolean} | ${nll} | ${string} | ${array} | ${object}
`.key('value');
