import {
  join,
} from "gbnf/builder";
import {
  COMMA_KEY,
} from "../constants/grammar-keys.js";
import { star, } from "../utils/get-star.js";

export const getTables = ({
  table,
  optionalWhitespace,
}: {
  optionalWhitespace: string,
  table: string
}) => join(
  table,
  star(
    COMMA_KEY,
    optionalWhitespace,
    table
  )
);

