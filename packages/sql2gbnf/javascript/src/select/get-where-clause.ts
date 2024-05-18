import {
  join,
} from "gbnf";
import { opt, } from "./get-optional.js";
import { star, } from "./get-star.js";
import { any, } from "../utils/any.js";

export const getWhereClause = ({
  not,
  whereClauseInner,
  where,
  andMore,
  orMore,
  mandatoryWhitespace,
}: {
  mandatoryWhitespace: string;
  not: string;
  whereClauseInner: string;
  where: string;
  andMore: string;
  orMore: string;
}) => join(
  mandatoryWhitespace,
  where,
  opt(mandatoryWhitespace, not),
  mandatoryWhitespace,
  whereClauseInner,
  star(any(andMore, orMore)),
);
