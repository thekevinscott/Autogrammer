import {
  join,
} from "gbnf";
import { star, } from "./get-star.js";

export const getGroupByClause = ({
  comma,
  group,
  validColName,
  optionalWhitespace,
  whitespace: ws,
}: {
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
  star(
    comma,
    optionalWhitespace,
    validColName,
  ),
);
