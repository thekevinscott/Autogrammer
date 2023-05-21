import basicTests from "./basic-select-tests.js";
import foundCodeTests from "./found-code-select/index.js";
import tests from "./synthetic-llm-select-tests.js";
export const noSchemaTests = [
  ...basicTests,
  ...foundCodeTests,
  ...tests,
];
