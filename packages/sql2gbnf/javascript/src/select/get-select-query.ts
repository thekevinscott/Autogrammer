import {
  join,
} from "gbnf/builder-v1";
import { opt, } from "../utils/get-optional.js";
import { star, } from "../utils/get-star.js";

export const getSelectQuery = ({
  distinct,
  select,
  whereClause,
  orderByClause,
  limitClause,
  joinClause,
  groupByClause,
  havingClause,
  whitespace: ws,
  selectlist,
}: {
  distinct: string;
  select: string;
  whereClause: string;
  orderByClause: string;
  limitClause: string;
  joinClause: string;
  groupByClause: string;
  havingClause: string;
  whitespace: string;
  selectlist: string;
}) => join(
  select,
  opt(ws, distinct),
  ws,

  selectlist,
  star(ws, joinClause),
  opt(whereClause),
  opt(groupByClause),
  opt(havingClause),
  opt(orderByClause),
  opt(limitClause),
);
