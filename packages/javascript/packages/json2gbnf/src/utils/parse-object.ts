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
import { Grammar, } from '../grammar.js';
import {
  join,
  joinWith,
} from './join.js';
import {
  isSchemaConst,
  isSchemaEnum,
} from '../type-guards.js';
import { getPropertyDefinition, } from './get-property-definition.js';
import { getConstDefinition, } from './get-const-definition.js';

const UNSUPPORTED_PROPERTIES: (keyof JSONSchemaObject)[] = [
  'patternProperties',
  'allOf',
  'unevaluatedProperties',
  'propertyNames',
  'minProperties',
  'maxProperties',
];

const getPropertiesValue = (grammar: Grammar, value: JSONSchemaValue): string[] => {
  if (isSchemaConst(value)) {
    return getConstDefinition(value);
  }
  if (isSchemaEnum(value)) {
    return [parseEnum(value, grammar.addRule),];
  }
  return [parseType(grammar, value),];
};

export const parseObject = (
  grammar: Grammar,
  schema: JSONSchemaObject,
) => {
  for (const key of UNSUPPORTED_PROPERTIES) {
    if (key in schema) {
      throw new Error(`${key} is not supported`);
    }
  }
  const { additionalProperties = true, properties, required = [], } = schema;
  if (properties !== undefined && typeof properties === 'object') {
    const COLON = grammar.getConst(COLON_KEY);
    const LB = grammar.getConst(LEFT_BRACE_KEY, { left: false, });
    const RB = grammar.getConst(RIGHT_BRACE_KEY, { right: false, });
    const SEPARATOR = grammar.getConst(COMMA_KEY, { left: false, });
    const PROPERTY_KEY = additionalProperties ? grammar.addRule(getPropertyDefinition(SEPARATOR)) : undefined;

    const objectProperties: { rule: string; key: string }[] = Object.entries(properties).map(([key, value,]) => ({
      rule: grammar.addRule(join(
        QUOTE_KEY,
        `"${key}"`,
        QUOTE_KEY,
        COLON,
        ...getPropertiesValue(grammar, value),
      )),
      key,
    }));

    const requiredsToKeys = objectProperties.reduce<Record<string, string>>((acc, { rule, key, }) => ({
      ...acc,
      [key]: rule,
    }), {});

    const rules = objectProperties.map(({ rule, }) => rule);

    if (grammar.fixedOrder) {
      return join(
        LB,
        `(${joinWith(
          ` ${SEPARATOR} `,
          ...rules.map((rule, i) => (i === rules.length - 1 && additionalProperties) ? join(rule, PROPERTY_KEY) : rule),
        )})`,
        RB,
      );
    }

    const requireds = required.map(key => requiredsToKeys[key]);

    const permutations = getAllPermutations(rules, requireds,)
      .map(permutation => additionalProperties ? permutation.map(perm => join(perm, PROPERTY_KEY)) : permutation)
      .map(permutation => permutation.length > 1 ? grammar.addRule(
        joinWith(` ${SEPARATOR} `, ...permutation),
      ) : permutation[0]);

    return join(
      LB,
      `(${joinWith(' | ', ...permutations)})${required.length > 0 ? '' : '?'}`,
      RB,
    );
  }

  return OBJECT_KEY;
};
