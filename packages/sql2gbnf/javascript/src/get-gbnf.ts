import {
  _,
  GBNFRule,
} from "gbnf/builder-v2";
import {
  select as getSelectRule,
} from "./select/index.js";
import type {
  CaseKind,
  Database,
  WhitespaceKind,
} from "./types.js";
import {
  getInsertRule,
} from "./insert/index.js";
import {
  getDeleteRule,
} from "./delete/index.js";
import {
  getWhitespaceDefs,
} from "./utils/get-whitespace-def.js";
import { $, } from "gbnf/builder-v2";

export const getGBNF = (
  opts: {
    whitespace: WhitespaceKind;
    case: CaseKind,
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  database?: Database,
  // schema?: string,
): GBNFRule => {
  const validString = _`[^\'\\"]+`;
  const stringWithQuotes = _`${_`"'" ${validString} "'"`} | ${_`"\\"" ${validString} "\\""`}`;
  const validName = _`[a-zA-Z_] [a-zA-Z0-9_]*`;
  const validFullName = _` ${validName} ${_`"." ${validName}`.wrap('*')} `;
  const positiveInteger = _`[0-9] | [1-9] [0-9]*`.wrap("?");

  const {
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: ws,
  } = getWhitespaceDefs(opts.whitespace);

  const number = _`
    ${_`
      "-"? 
      ${_`[0-9] | [1-9] [0-9]*`.wrap()}
    `.wrap()} 
    ${_`"." [0-9]+`.wrap('?')} 
    ${_`[eE] [-+]? [0-9]+`.wrap('?')} 
  `;
  const boolean = _`"TRUE" | "FALSE" | "true" | "false"`;
  const equalOps = _`
    "=" 
    | "!=" 
    | ${_`
      ${$`IS`} 
      ${ws} 
      ${_`
        ${$`NOT`} 
        ${ws}
        `.wrap('?')}
      `}
  `;
  const arithmeticOps = _`"+" | "-" | "*" | "/"`;
  const numericOps = _`">" | "<" | ">=" | "<="`;

  const selectRule = getSelectRule({
    equalOps,
    arithmeticOps,
    numericOps,
    positiveInteger,
    boolean,
    number,
    validFullName,
    stringWithQuotes,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace: ws,
    withUnion: true,
  });

  const insertRule = getInsertRule({
    equalOps,
    arithmeticOps,
    numericOps,
    positiveInteger,
    boolean,
    number,
    validFullName,
    stringWithQuotes,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace: ws,
  });

  const deleteRule = getDeleteRule({
    equalOps,
    arithmeticOps,
    numericOps,
    positiveInteger,
    boolean,
    number,
    validFullName,
    stringWithQuotes,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace: ws,
  });

  const gbnf = _`
    ${_`
      ${selectRule}
      | ${insertRule} 
      | ${deleteRule}
    `.wrap()}
    ${_`
      ${optionalNonRecommendedWhitespace} 
      ";"
    `.wrap('?')}
  `;
  console.log(gbnf.compile());
  return gbnf;
};
