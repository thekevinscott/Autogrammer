import {
  join,
} from "gbnf/builder";
import { opt, } from "../utils/get-optional.js";

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
