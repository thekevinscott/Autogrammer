import {
  join,
} from "gbnf";

export const getTableName = ({
  validName,
  asAlias,
}: {
  validName: string;
  asAlias: string;
}) => join(
  validName,
  asAlias
);
