import {
  join,
} from "gbnf/builder-v1";
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
