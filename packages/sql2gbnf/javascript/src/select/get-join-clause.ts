import {
  join,
} from "gbnf";
import { opt, } from "../utils/get-optional.js";

export const getJoinClause = ({
  joinKey,
  joinType,
  tableWithOptionalAlias,
  on,
  whitespace: ws,
  joinCondition,
}: {
  whitespace: string;
  joinType: string,
  joinKey: string;
  tableWithOptionalAlias: string;
  on: string;
  joinCondition: string;
}) => join(
  opt(joinType),
  joinKey,
  ws,
  tableWithOptionalAlias,
  ws,
  on,
  ws,
  joinCondition,
);
