import { join, } from "gbnf/builder-v1";
import { star, } from "../utils/get-star.js";
import { opt, } from "../utils/get-optional.js";

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
