import {
  join,
} from "gbnf";
import {
  COMMA_KEY,
} from "../constants/grammar-keys.js";
import { star, } from "./get-star.js";

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

