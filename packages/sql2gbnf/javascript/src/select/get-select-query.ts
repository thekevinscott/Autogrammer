import {
  join,
} from "gbnf";
import { opt, } from "./get-optional.js";
import { star, } from "./get-star.js";
import { rule, } from "./get-rule.js";
import { any, } from "../utils/any.js";

export const getSelectQuery = ({
  distinct,
  projection,
  select,
  from,
  selectTables,
  whereClause,
  orderByClause,
  limitClause,
  joinClause,
  groupByClause,
  havingClause,
  whitespace: ws,
  validTableName,
  into,
}: {
  distinct: string;
  projection: string;
  select: string;
  from: string;
  selectTables: string,
  whereClause: string;
  orderByClause: string;
  limitClause: string;
  joinClause: string;
  groupByClause: string;
  havingClause: string;
  whitespace: string;
  validTableName: string;
  into: string;
}) => join(
  select,
  opt(ws, distinct),
  ws,
  any(
    rule(
      projection,
      ws,
      opt(into, ws, validTableName, ws),
    ),
    rule(
      opt(into, ws, validTableName, ws),
      projection,
      ws,
    ),
  ),


  from,
  ws,
  selectTables,
  star(ws, joinClause),
  opt(whereClause),
  opt(groupByClause),
  opt(havingClause),
  opt(orderByClause),
  opt(limitClause),
);
