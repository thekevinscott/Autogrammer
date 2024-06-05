import {
  $,
  GBNFRule,
  _,
} from "gbnf/builder-v2";
import {
  FULL_SELECT_QUERY,
} from './keys.js';

export const validString = _`[^\'\\"]+`;
export const stringWithQuotes = _`${_`"'" ${validString} "'"`} | ${_`"\\"" ${validString} "\\""`}`;
export const validName = _`[a-zA-Z_] [a-zA-Z0-9_]*`;
export const databaseName = _`${validName}`;
export const tableName = _`${_`${databaseName} "." `.wrap('?')} ${validName}`;
export const columnName = _`${_`${tableName} "." `.wrap('?')} ${validName}`;
export const positiveInteger = _`[0-9] | [1-9] [0-9]*`.wrap("?");
export const getTableWithAlias = (ws: GBNFRule) => _`
  ${tableName}
  ${_`${ws} ${validAlias}`.wrap('?')}
`;

export const number = _`
    ${_`
      "-"? 
      ${_`[0-9] | [1-9] [0-9]*`.wrap()}
    `.wrap()} 
    ${_`"." [0-9]+`.wrap('?')} 
    ${_`[eE] [-+]? [0-9]+`.wrap('?')} 
  `;
export const boolean = _`${$`TRUE`} | ${$`FALSE`}`;
export const validValue = _`${_`[a-zA-Z] [a-zA-Z0-9_]*`} | ${number} | ${boolean} | "NULL" | "null"`;
export const validAlias = _`[a-zA-Z] [a-zA-Z0-9_]*`;

export const getEqualOps = (ws: GBNFRule) => _`
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
export const arithmeticOps = _`"+" | "-" | "*" | "/"`;
export const numericOps = _`">" | "<" | ">=" | "<="`;

export const getAsAlias = (ws: GBNFRule) => _`${$`AS`} ${ws} ${validAlias}`;

export const getDirection = (ws: GBNFRule) => _` ${ws} ${_`${$`ASC`} | ${$`DESC`}`} `;
export const unit = _` ${$`DAY`} | ${$`MONTH`} | ${$`YEAR`} | ${$`HOUR`} | ${$`MINUTE`} | ${$`SECOND`} `;

export const dateDef = _` "'" [0-9] [0-9] [0-9] [0-9] "-" [0-9] [0-9] "-" [0-9] [0-9] "'" `;

export const getColumnNames = ({
  optRecWS,
  optNonRecWS,
  ws,
}: {
  optRecWS: GBNFRule | undefined;
  optNonRecWS: GBNFRule | undefined;
  ws: GBNFRule;
}) => _`
${columnName}
| ${validValue}
| ${_`
    "(" 
      ${optNonRecWS} 
      ${FULL_SELECT_QUERY}
      ${optNonRecWS} 
    ")"
  `}
| ${_`
    ${_`
      ${$`MIN`} 
      | ${$`MAX`} 
      | ${$`AVG`} 
      | ${$`SUM`}
    `.wrap()}
    "("
      ${optNonRecWS}
      ${_`
        ${$`DISTINCT`} 
        ${ws}
      `.wrap('?')}
      ${columnName}
      ${_`
        ${optRecWS}
        ${arithmeticOps}
        ${optRecWS}
        ${columnName}
        ${optRecWS}
      `.wrap('*')}
      ${optNonRecWS}
    ")"
  `}
| ${_`
    ${$`COUNT`}
    ${optNonRecWS}
    ${$`(`}
    ${optNonRecWS}
    ${_`
      ${$`*`}
      | ${_`
          ${_`
            ${$`DISTINCT`} 
            ${ws}
          `.wrap('?')}
          ${columnName}
          ${_`
            ${optRecWS}
            ${arithmeticOps}
            ${optRecWS}
            ${columnName}
          `.wrap('*')}
      `}
    `}
    ${optNonRecWS}
    ${$`)`}
  `}
`;
