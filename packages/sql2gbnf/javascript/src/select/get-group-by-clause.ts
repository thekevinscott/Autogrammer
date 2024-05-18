import {
  join,
} from "gbnf";
import { star, } from "./get-star.js";
import { opt, } from "./get-optional.js";

export const getGroupByClause = ({
  comma,
  group,
  validColName,
  optionalWhitespace,
  whitespace: ws,
  asAlias,
}: {
  asAlias: string,
  whitespace: string;
  comma: string;
  group: string;
  validColName: string;
  optionalWhitespace: string;
}) => join(
  ws,
  group,
  ws,
  validColName,
  opt(ws, asAlias),
  star(
    comma,
    optionalWhitespace,
    validColName,
  ),
);
