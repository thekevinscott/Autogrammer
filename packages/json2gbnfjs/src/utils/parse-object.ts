import { getAllPermutations, } from './get-all-permutations.js';
import { parseEnum, } from './parse-enum.js';
import {
  COLON_KEY,
  COMMA_KEY,
  LEFT_BRACE_KEY,
  OBJECT_KEY,
  QUOTE_KEY,
  RIGHT_BRACE_KEY,
} from '../constants/grammar-keys.js';
import {
  JSONSchemaObject,
  JSONSchemaValue,
} from '../types.js';
import { parseType, } from './parse-type.js';
import { SchemaParser, } from '../schema-parser.js';
import {
  join,
  joinWith,
} from './join.js';
import {
  isSchemaConst,
  isSchemaEnum,
} from '../type-guards.js';

const UNSUPPORTED_PROPERTIES = [
  'patternProperties',
  'additionalProperties',
  'allOf',
  'unevaluatedProperties',
  'propertyNames',
  'minProperties',
  'maxProperties',
];

const getPropertiesValue = (parser: SchemaParser, value: JSONSchemaValue): string[] => {
  if (isSchemaConst(value)) {
    return [
      QUOTE_KEY,
      `"${value.const}"`,
      QUOTE_KEY,
    ];
  }
  if (isSchemaEnum(value)) {
    return [parseEnum(value, parser.addRule),];
  }
  return [parseType(parser, value),];
};

export const parseObject = (
  parser: SchemaParser,
  schema: JSONSchemaObject,
) => {
  for (const key of UNSUPPORTED_PROPERTIES) {
    if (key in schema) {
      throw new Error(`${key} is not supported`);
    }
  }
  const { properties, required = [], } = schema;
  if (properties !== undefined && typeof properties === 'object') {
    const COLON = parser.getConst(COLON_KEY);
    const LB = parser.getConst(LEFT_BRACE_KEY, { left: false, });
    const RB = parser.getConst(RIGHT_BRACE_KEY, { right: false, });
    const COMMA = parser.getConst(COMMA_KEY, { left: false, });

    const objectProperties: { rule: string; key: string }[] = Object.entries(properties).map(([key, value,]) => ({
      rule: parser.addRule(join(
        QUOTE_KEY,
        `"${key}"`,
        QUOTE_KEY,
        COLON,
        ...getPropertiesValue(parser, value),
      )),
      key,
    }));

    const requiredsToKeys = objectProperties.reduce<Record<string, string>>((acc, { rule, key, }) => ({
      ...acc,
      [key]: rule,
    }), {});

    const rules = objectProperties.map(({ rule, }) => rule);

    if (parser.fixedOrder) {
      return join(
        LB,
        `(${joinWith(` ${COMMA} `, ...rules)})`,
        RB,
      );
    }

    const requireds = required.map(key => requiredsToKeys[key]);

    const permutations = getAllPermutations(
      rules,
      requireds,
    ).map(permutation => permutation.length <= 1 ? permutation[0] : parser.addRule(
      joinWith(` ${COMMA} `, ...permutation),
    ));

    return join(
      LB,
      `(${joinWith(' | ', ...permutations)})${required.length > 0 ? '' : '?'}`,
      RB,
    );
  }

  return OBJECT_KEY;
};
