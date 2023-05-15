import {
  join,
} from "gbnf";
import { opt, } from "./get-optional.js";

export const getLimitClause = ({
  limit,
  offset,
  positiveInteger,
  comma,
  whitespace: ws,
  optionalWhitespace,
}: {
  whitespace: string,
  optionalWhitespace: string;
  limit: string;
  offset: string;
  positiveInteger: string;
  comma: string;
}) => join(
  ws,
  limit,
  opt(
    optionalWhitespace,
    positiveInteger,
    comma,
  ),
  optionalWhitespace,
  positiveInteger,
  opt(
    ws,
    offset,
    ws,
    positiveInteger,
  ),
);
