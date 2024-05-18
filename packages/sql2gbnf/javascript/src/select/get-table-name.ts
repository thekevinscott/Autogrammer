import {
  join,
} from "gbnf";
import { opt, } from "./get-optional.js";

export const getTableName = ({
  validName,
  asAlias,
  whitespace,
}: {
  validName: string;
  asAlias: string;
  whitespace: string;
}) => join(
  validName,
  opt(whitespace, asAlias),
);
