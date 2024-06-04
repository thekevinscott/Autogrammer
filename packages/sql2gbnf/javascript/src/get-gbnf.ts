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
  insert as getInsertRule,
} from "./insert/index.js";
import { getWhitespaceDefs, } from "./utils/get-whitespace-def.js";

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

  const {
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    whitespace: mandatoryWhitespace,
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

  const selectRule = getSelectRule({
    boolean,
    number,
    validFullName,
    stringWithQuotes,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace,
    withUnion: true,
  });

  const insertRule = getInsertRule({
    boolean,
    number,
    validFullName,
    stringWithQuotes,
    optionalRecommendedWhitespace,
    optionalNonRecommendedWhitespace,
    mandatoryWhitespace,
  });

  return _.key('root')`
    ${_` ${selectRule} | ${insertRule} `.wrap()}
    ${_`${optionalNonRecommendedWhitespace} ";"`.wrap('?')}
  `;
};
