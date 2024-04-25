/* eslint-disable @typescript-eslint/ban-types */
import {
  GLOBAL_CONSTANTS,
} from './constants.js';
import {
  ARRAY_KEY,
  BOOLEAN_KEY,
  CHAR_KEY,
  INTEGER_KEY,
  NULL_KEY,
  NUMBER_KEY,
  STRING_KEY,
  VALUE_KEY,
  COMMA_KEY,
  COLON_KEY,
  QUOTE_KEY,
  LEFT_BRACE_KEY,
  RIGHT_BRACE_KEY,
  OBJECT_KEY,
  LEFT_BRACKET_KEY,
  RIGHT_BRACKET_KEY,
  WHITESPACE_KEY,
  WHITESPACE_REPEATING_KEY,
  KEYS,
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
  isSchemaMultipleBasicTypes,
} from './types.js';


// export const JSON_ALL_VALID_VALUES = `object | array | string | number | boolean | null`;

const idOf = (i: number) => (
  (i >= 26 ? idOf(((i / 26) >> 0) - 1) : "") +
  "abcdefghijklmnopqrstuvwxyz"[i % 26 >> 0]
);

export interface SchemaOpts {
  includeWS?: boolean,
  fixedOrder?: boolean;
  maxWhiteSpace?: number;
}

class SchemaParser {
  #rules = new Map<string, string>();
  #opts: SchemaOpts;

  constructor(schema: TopLevelJSONSchema, opts: SchemaOpts = {}) {
    this.#opts = opts;
    if (schema === true || isEmptyObject(schema)) {
      this.addRule(VALUE_KEY, 'root');
    } else if (schema === false) {
      throw new Error('Not implemented yet');
    } else {
      this.parse(schema, 'root');
    }
  }

  getWhitespace = () => {
    if (this.#opts.maxWhiteSpace !== undefined) {
      return this.addRule(Array(this.#opts.maxWhiteSpace).fill(`(${WHITESPACE_KEY})?`).join(' '));
    }
    return WHITESPACE_REPEATING_KEY;
  };

  getConst = (key: string, { left = true, right = true, }: { left?: boolean; right?: boolean } = {}): string => {
    if (this.#opts.includeWS) {
      const KEY = `${left ? 'ws' : ''}${key}${right ? 'ws' : ''}`;
      return this.addRule([
        left ? this.getWhitespace() : undefined,
        key,
        right ? this.getWhitespace() : undefined,
      ].filter(Boolean).join(' '), KEY);
    }
    return key;
  };

  addRule(rule: string, _key?: string) {
    const key = _key ? _key : this.#rules.get(rule) ?? `x${idOf(this.#rules.size)}`;
    this.#rules.set(rule, key);
    return key;
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
      return STRING_KEY;
    } else {
      if (minLength !== undefined && maxLength !== undefined) {
        return `${QUOTE_KEY} ${Array(minLength).fill(CHAR_KEY).join(' ')} ${Array(maxLength - minLength).fill(`(${CHAR_KEY})?`).join(' ')} ${QUOTE_KEY} `;
      } else if (maxLength === undefined && minLength !== undefined) {
        return `${QUOTE_KEY} ${Array(minLength - 1).fill(CHAR_KEY).join(' ')} (${CHAR_KEY})+ ${QUOTE_KEY} `;
      } else if (minLength === undefined && maxLength !== undefined) {
        return `${QUOTE_KEY} ${Array(maxLength).fill(`(${CHAR_KEY})?`).join(' ')} ${QUOTE_KEY} `;
      }
    }
  }

  parseEnum(schema: JSONSchemaObjectValueEnum) {
    const rule = schema.enum.map(value => `${QUOTE_KEY} "${value}" ${QUOTE_KEY}`).join(' | ');
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
          return [this.addRule(`${QUOTE_KEY} "${key}" ${QUOTE_KEY} ${this.getConst(COLON_KEY)} ${this.parseEnum(value)}`), key,];
        }
        if (isSchemaConst(value)) {
          return [this.addRule(`${QUOTE_KEY} "${key}" ${QUOTE_KEY} ${this.getConst(COLON_KEY)} ${QUOTE_KEY} "${value.const}" ${QUOTE_KEY}`), key,];
        }
        return [this.addRule(`${QUOTE_KEY} "${key}" ${QUOTE_KEY} ${this.getConst(COLON_KEY)} ${this.parseType(value)}`), key,];
      });
      const requiredsToKeys = objectProperties.reduce<Record<string, string>>((acc, [rule, key,]) => ({
        ...acc,
        [key]: rule,
      }), {});

      const LB = this.getConst(LEFT_BRACE_KEY, { left: false, });
      const RB = this.getConst(RIGHT_BRACE_KEY, { right: false, });

      if (this.#opts.fixedOrder) {
        return [
          LB,
          `(${objectProperties.map(([rule,]) => rule).join(` ${this.getConst(COMMA_KEY)} `)})`,
          RB,
        ].join(' ');
      }

      const permutations = getAllPermutations(objectProperties.map(([prop,]) => prop), required.map(key => requiredsToKeys[key])).map(permutation => {
        if (permutation.length > 1) {
          return this.addRule(permutation.join(` ${this.getConst(COMMA_KEY, { left: false, })} `));
        }
        return permutation[0];
      });


      return [
        LB,
        `(${permutations.filter(Boolean).join(" | ")})${required.length > 0 ? '' : '?'}`,
        RB,
      ].join(' ');
    }
    return OBJECT_KEY;
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
        const symbolId = this.addRule(items.type.map((type: string) => {
          const key = `${type.toUpperCase()}_KEY`;
          if (key in KEYS) {
            return KEYS[key];
          }
          return type;
        }).join(' | '));
        return `${this.getConst(LEFT_BRACKET_KEY, { left: false, })} (${symbolId} (${this.getConst(COMMA_KEY)} ${symbolId})*)? ${this.getConst(RIGHT_BRACKET_KEY, { right: false, })}`;
      }
      return `${this.getConst(LEFT_BRACKET_KEY, { left: false, })} (${this.parseType(items)} (${this.getConst(COMMA_KEY)} ${this.parseType(items)})*)? ${this.getConst(RIGHT_BRACKET_KEY, { right: false, })}`;
    }
    return ARRAY_KEY;
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
        return NUMBER_KEY;
      } else {
        return INTEGER_KEY;
      }
    } else if (type === 'boolean') {
      return BOOLEAN_KEY;
    } else if (type === 'null') {
      return NULL_KEY;
    } else if (type === 'array') {
      return this.parseArray(schema);
    } else if (type === 'object') {
      return this.parseObject(schema);
    }
  }

  parse(schema: JSONSchema, symbolName: string) {
    if (isSchemaEnum(schema)) {
      this.addRule(`${schema.enum.map(e => {
        const type = JSON.stringify(e);
        if (type === 'null') {
          return NULL_KEY;
        }
        return JSON.stringify(type);
      }).join(" | ")}`, symbolName);
    } else {
      const { type, } = schema;
      if (Array.isArray(type)) {
        // if type is an array, then it must not be a structured data type
        this.addRule(`${type.map(_type => {
          const key = `${_type.toUpperCase()}_KEY`;
          if (!(key in KEYS)) {
            throw new Error(`Unknown type ${_type} for schema ${JSON.stringify(schema)}`);
          }
          return KEYS[key];
        }).join(' | ')}`, symbolName);
      } else {
        if (isSchemaMultipleBasicTypes(schema)) {
          throw new Error('This should not be possible: encountered array of types');
        }
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
      ...GLOBAL_CONSTANTS,
    ].join('\n');
  }
}

export function JSON2GBNF<T extends JSONSchema>(schema?: {} | null | T | boolean, opts?: SchemaOpts): string {
  if (schema === null || schema === undefined) {
    throw new Error('Bad schema provided');
  }
  if (isSchemaObject(schema) && '$schema' in schema && schema['$schema'] !== undefined && schema['$schema'] !== 'https://json-schema.org/draft/2020-12/schema') {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
    throw new Error(`Unsupported schema version: ${schema['$schema']}`);
  }
  const parser = new SchemaParser(schema, opts);
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

