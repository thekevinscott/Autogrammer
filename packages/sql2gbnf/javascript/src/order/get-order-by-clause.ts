import {
  $,
  _,
  GBNFRule,
} from "gbnf/builder";
import {
  getAsAlias,
  getColumnNames,
  getDirection,
} from "../constants.js";

export const getOrderByClause = ({
  ws,
  optNonRecWS,
  optRecWS,
}: {
  ws: GBNFRule;
  optNonRecWS: GBNFRule | undefined;
  optRecWS: GBNFRule | undefined;
}): GBNFRule => {
  const asAlias = getAsAlias(ws);
  const direction = getDirection(ws);
  const columnNames = getColumnNames({
    ws,
    optNonRecWS,
    optRecWS,
  });
  return _`
    ${ws} ${$`ORDER BY`}
    ${ws}
    ${columnNames}
    ${_`${ws} ${asAlias}`.wrap('?')}
    ${_`${direction}`.wrap('?')}
    ${_`
      "," 
      ${optRecWS} 
      ${columnNames} 
      ${direction.wrap('?')}
    `.wrap('*')}
  `;
};
