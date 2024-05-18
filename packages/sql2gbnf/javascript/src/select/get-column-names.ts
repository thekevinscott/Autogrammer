import { any, } from "../utils/any.js";

export const getColumnNames = ({
  validName,
  countAggregatorRule,
  otherAggregatorsRule,
}: {
  countAggregatorRule: string,
  otherAggregatorsRule: string;
  validName: string;
}) => any(
  validName,
  countAggregatorRule,
  otherAggregatorsRule,
);
