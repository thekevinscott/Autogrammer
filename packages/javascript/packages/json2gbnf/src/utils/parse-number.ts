import { INTEGER_KEY, NUMBER_KEY, } from "../constants/grammar-keys.js";
import { type JSONSchemaNumber, } from "../types.js";


const UNSUPPORTED_NUMERIC_PROPERTIES: (keyof JSONSchemaNumber)[] = [
  'exclusiveMinimum',
  'exclusiveMaximum',
  'multipleOf',
  'minimum',
  'maximum',
];

export const parseNumber = (schema: JSONSchemaNumber) => {
  for (const key of UNSUPPORTED_NUMERIC_PROPERTIES) {
    if (schema[key] !== undefined) {
      throw new Error(`${key} is not supported`);
    }
  }
  const { type, } = schema;
  if (type === 'number') {
    return NUMBER_KEY;
  } else {
    return INTEGER_KEY;
  }
};
