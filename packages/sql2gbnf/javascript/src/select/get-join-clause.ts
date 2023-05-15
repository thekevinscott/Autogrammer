import {
  join,
} from "gbnf";
import { opt, } from "./get-optional.js";

export const getJoinClause = ({
  joinKey,
  joinType,
  tableWithOptionalAlias,
  columnName,
  on,
  optionalWhitespace,
  whitespace: ws,
}: {
  whitespace: string;
  optionalWhitespace: string;
  joinType: string,
  joinKey: string;
  tableWithOptionalAlias: string;
  columnName: string;
  on: string;
}) => join(
  ws,
  opt(joinType),
  joinKey,
  ws,
  tableWithOptionalAlias,
  ws,
  on,
  ws,
  tableWithOptionalAlias,
  optionalWhitespace,
  '"="',
  optionalWhitespace,
  columnName,
);
