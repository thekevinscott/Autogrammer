import { join, } from "gbnf";
import { star, } from "./get-star.js";
import { opt, } from "./get-optional.js";

export const getSelectQueryWithUnion = ({
  union,
  all,
  selectQuery,
  whitespace: ws,
}: {
  whitespace: string,
  union: string;
  all: string;
  selectQuery: string;
}) => join(
  selectQuery,
  star(
    ws,
    union,
    opt(
      ws,
      all
    ),
    ws,
    selectQuery,
  ),
);
