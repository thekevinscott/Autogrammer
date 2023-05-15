import {
  join,
} from "gbnf";
import {
  SEMI_KEY,
} from "../constants/grammar-keys.js";
import { opt, } from "./get-optional.js";
import { star, } from "./get-star.js";

export const getSelectQuery = ({
  distinct,
  selectColumns,
  select,
  from,
  selectTables,
  whereClause,
  orderByClause,
  limitClause,
  joinClause,
  groupByClause,
  havingClause,
  whitespace,
}: {
  distinct: string;
  selectColumns: string;
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
}) => join(
  select,
  whitespace,
  opt(distinct, whitespace),
  selectColumns,
  whitespace,
  from,
  whitespace,
  selectTables,
  star(joinClause),
  opt(whereClause),
  opt(groupByClause),
  opt(havingClause),
  opt(orderByClause),
  opt(limitClause),
  opt(opt(whitespace), SEMI_KEY),
);
