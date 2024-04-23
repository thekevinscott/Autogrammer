/* eslint-disable @typescript-eslint/ban-types */
import {
  objectDef,
  arrayDef,
  stringDef,
  numberDef,
  boolDef,
  nullDef,
  charDef,
  integerDef,
} from './grammar/index.js';
import {
  type JSONSchema,
  type JSONSchemaArray,
  type JSONSchemaBoolean,
  type JSONSchemaNull,
  type JSONSchemaNumber,
  type JSONSchemaObject,
  type JSONSchemaObjectValueEnum,
  type JSONSchemaString,
  type TopLevelJSONSchema,
  isEmptyObject,
  isSchemaConst,
  isSchemaEnum,
  isSchemaObject,
} from './types.js';

export const JSON_ALL_VALID_VALUES = `object | array | string | number | boolean | null`;
export const JSON_VALUE_DEFS = [
  `value ::= ${JSON_ALL_VALID_VALUES}`,
  `object ::= ${objectDef}`,
  `array ::= ${arrayDef}`,
  `string ::= ${stringDef}`,
  `char ::= ${charDef}`,
  `number ::= ${numberDef}`,
  `integer ::= ${integerDef}`,
  `boolean ::= ${boolDef}`,
  `null ::= ${nullDef}`,
];

// export const JSON_ALL_VALID_VALUES = `object | array | string | number | boolean | null`;

const idOf = (i: number) => (
  (i >= 26 ? idOf(((i / 26) >> 0) - 1) : "") +
  "abcdefghijklmnopqrstuvwxyz"[i % 26 >> 0]
);

class SchemaParser {
  #rules = new Map<string, string>();

  addRule(rule: string, _key?: string) {
    const key = _key ? _key : this.#rules.get(rule) ?? `r${idOf(this.#rules.size)}`;
    this.#rules.set(rule, key);
    return key;
  }

  constructor(schema: TopLevelJSONSchema) {
    if (schema === true || isEmptyObject(schema)) {
      this.addRule('value', 'root');
    } else if (schema === false) {
      throw new Error('Not implemented yet');
    } else {
      this.parse(schema, 'root');
    }
  }

  parseString(schema: JSONSchemaString) {
    const { format, pattern, minLength, maxLength, } = schema;
    if (pattern !== undefined) {
      throw new Error('pattern is not supported');
    }
    if (format !== undefined) {
      throw new Error('format is not supported');
    }

    if (minLength !== undefined && maxLength !== undefined && minLength > maxLength) {
      throw new Error('minLength must be less than or equal to maxLength');
    }

    if (minLength === undefined && maxLength === undefined) {
      return 'string';
    } else {
      if (minLength !== undefined && maxLength !== undefined) {
        return `"\\"" ${Array(minLength).fill('char').join(' ')} ${Array(maxLength - minLength).fill(`(char)?`).join(' ')} "\\"" `;
      } else if (maxLength === undefined && minLength !== undefined) {
        return `"\\"" ${Array(minLength - 1).fill('char').join(' ')} (char)+ "\\"" `;
      } else if (minLength === undefined && maxLength !== undefined) {
        return `"\\"" ${Array(maxLength).fill(`(char)?`).join(' ')} "\\"" `;
      }
    }
  }

  parseEnum(schema: JSONSchemaObjectValueEnum) {
    const rule = schema.enum.map(value => `"\\"${value}\\""`).join(' | ');
    return this.addRule(rule);
  }

  parseObject(schema: JSONSchemaObject) {
    for (const key of ['patternProperties', 'additionalProperties', 'allOf', 'unevaluatedProperties', 'propertyNames', 'minProperties', 'maxProperties',]) {
      if (key in schema) {
        throw new Error(`${key} is not supported`);
      }
    }
    const { properties, required = [], } = schema;
    if (properties !== undefined && typeof properties === 'object') {
      const objectProperties: [string, string][] = Object.entries(properties).map(([key, value,]) => {
        if (isSchemaEnum(value)) {
          return [this.addRule(`"\\"${key}\\":" ${this.parseEnum(value)}`), key,];
        }
        if (isSchemaConst(value)) {
          return [this.addRule(`"\\"${key}\\":\\"${value.const}\\""`), key,];
        }
        return [this.addRule(`"\\"${key}\\":" ${this.parseType(value)}`), key,];
      });
      const requiredsToKeys = objectProperties.reduce<Record<string, string>>((acc, [rule, key,]) => ({
        ...acc,
        [key]: rule,
      }), {});


      const permutations = getAllPermutations(objectProperties.map(([prop,]) => prop), required.map(key => requiredsToKeys[key])).map(permutation => {
        if (permutation.length > 1) {
          return this.addRule(permutation.join(' "," '));
        }
        return permutation[0];
      });

      return `"{" (${permutations.filter(Boolean).join(" | ")})${required.length > 0 ? '' : '?'} "}"`;
    }
    return 'object';
  }

  parseArray(schema: JSONSchemaArray): string {
    for (const key of ['prefixItems', 'unevaluatedItems', 'contains', 'minContains', 'maxContains', 'minItems', 'maxItems', 'uniqueItems',]) {
      if (schema[key] !== undefined) {
        throw new Error(`${key} is not supported`);
      }
    }
    if (typeof schema.items === 'boolean') {
      throw new Error('boolean items is not supported, because prefixItems is not supported');
    }
    const { items, } = schema;
    if (items !== undefined) {
      if (Array.isArray(items.type)) {
        const symbolId = this.addRule(items.type.join(' | '));
        return `"[" (${symbolId} ("," ${symbolId})*)? "]"`;
      }
      return `"[" (${this.parseType(items)} ("," ${this.parseType(items)})*)? "]"`;
    }
    return 'array';
  }

  parseType(schema: JSONSchemaArray | JSONSchemaBoolean | JSONSchemaNull | JSONSchemaNumber | JSONSchemaString | JSONSchemaObject) {
    const { type, } = schema;
    if (type === 'string') {
      return this.parseString(schema);
    } else if (type === 'integer' || type === 'number') {
      for (const key of ['exclusiveMinimum', 'exclusiveMaximum', 'multipleOf', 'minimum', 'maximum',]) {
        if (schema[key] !== undefined) {
          throw new Error(`${key} is not supported`);
        }
      }
      if (type === 'number') {
        return 'number';
      } else {
        return 'integer';
      }
    } else if (type === 'boolean') {
      return 'boolean';
    } else if (type === 'null') {
      return 'null';
    } else if (type === 'array') {
      return this.parseArray(schema);
    } else if (type === 'object') {
      return this.parseObject(schema);
    }
  }

  parse(schema: JSONSchema, symbolName: string) {
    if (isSchemaEnum(schema)) {
      this.addRule(`${schema.enum.map(e => JSON.stringify(JSON.stringify(e))).join(" | ")}`, symbolName);
    } else {
      const { type, } = schema;
      if (Array.isArray(type)) {
        // if type is an array, then it must not be a structured data type
        this.addRule(`${type.join(' | ')}`, symbolName);
      } else {
        const ruleDef = this.parseType(schema);
        this.addRule(`${ruleDef}`, symbolName);
      }
    }
  }

  get rules() {
    const rules: string[] = [];
    for (const [rule, key,] of this.#rules.entries()) {
      rules.push(`${key} ::= ${rule}`);
    }
    return [
      ...rules,
      ...JSON_VALUE_DEFS,
    ].join('\n');
  }
}

export function JSON2GBNF<T extends JSONSchema>(schema?: {} | null | T | boolean): string {
  if (schema === null || schema === undefined) {
    throw new Error('Bad schema provided');
  }
  if (isSchemaObject(schema) && '$schema' in schema && schema['$schema'] !== undefined && schema['$schema'] !== 'https://json-schema.org/draft/2020-12/schema') {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
    throw new Error(`Unsupported schema version: ${schema['$schema']}`);
  }
  const parser = new SchemaParser(schema);
  return parser.rules;
};

const getAllPermutations = (array: string[], required: string[] = []): string[][] => {
  const result: string[][] = [];

  function generate(current: string[], remaining: string[]) {
    if (current.length > 0) {
      result.push([...current,]);
    }
    for (let i = 0; i < remaining.length; i++) {
      current.push(remaining[i]);
      generate(current, remaining.slice(0, i).concat(remaining.slice(i + 1)));
      current.pop();
    }
  }

  generate([], array);
  if (required.length === 0) {
    return result;
  }
  const filteredPermutations = result.filter(permutation => {
    let valid = true;
    for (const key of required) {
      if (!permutation.includes(key)) {
        valid = false;
        break;
      }
    }
    return valid;
  });
  return filteredPermutations;
};

