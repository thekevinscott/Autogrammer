import {
  join,
} from "gbnf";
import { opt, } from "../utils/get-optional.js";
import { rule, } from "../utils/get-rule.js";
import { any, } from "../utils/any.js";
import { star, } from "../utils/get-star.js";
import type { Database, } from "../types.js";

export const getSelectList = ({
  into,
  from,
  whitespace: ws,
  validTableName,
  projection,
  optionalRecommendedWhitespace,
  // selectTables,
  table,
  comma,
  // database,
}: {
  projection: string;
  into: string;
  from: string;
  whitespace: string;
  optionalRecommendedWhitespace: string;

  validTableName: string;
  // selectTables: string;
  table: string;
  comma: string;
  database: void | Database,
}) => {
  const selectNames = any(
    rule(
      any(projection, '"*"'),
      ws,
      opt(into, ws, validTableName, ws),
    ),
    rule(
      opt(into, ws, validTableName, ws),
      any(projection, '"*"'),
      ws,
    ),
  );

  return join(
    selectNames,
    from,
    ws,
    table,
    star(
      comma,
      optionalRecommendedWhitespace,
      table
    )
  );

};
