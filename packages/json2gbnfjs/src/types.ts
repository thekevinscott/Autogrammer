/* eslint-disable @typescript-eslint/ban-types */

export interface JSONSchemaObjectValueEnum {
  enum: string[];
}
export interface JSONSchemaObjectValueConst {
  const: string;
}
export interface JSONSchemaString {
  type: 'string';
  format?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}
export interface JSONSchemaNumber {
  type: 'number' | 'integer';
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  multipleOf?: unknown;
  minimum?: number;
  maximum?: number;
}
export interface JSONSchemaBoolean {
  type: 'boolean';
}
export interface JSONSchemaNull {
  type: 'null';
}

export interface JSONSchemaArray {
  type: 'array';
  items?: {
    type: 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
  } | false;
  prefixItems?: unknown;
  unevaluatedItems?: unknown;
  contains?: unknown;
  minContains?: number;
  maxContains?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}
export type JSONSchemaValue = JSONSchemaArray | JSONSchemaBoolean | JSONSchemaNull | JSONSchemaNumber | JSONSchemaString | JSONSchemaObject | JSONSchemaObjectValueEnum;
export interface JSONSchemaObject {
  type: 'object';
  properties?: Record<string, JSONSchemaValue>;
  patternProperties?: unknown;
  additionalProperties?: boolean | { type: JSONSchemaValue };
  allOf?: unknown;
  unevaluatedProperties?: unknown;
  required?: string[];
  propertyNames?: unknown;
  minProperties?: number;
  maxProperties?: number;
}
export interface JSONSchemaMultipleBasicTypes {
  type: ('string' | 'number' | 'boolean' | 'null' | 'object' | 'array')[]
}
export type JSONSchema = JSONSchemaValue | JSONSchemaMultipleBasicTypes;
export type TopLevelJSONSchema = {} | JSONSchema & {
  $schema?: string;
} | boolean;

export const isSchemaMultipleBasicTypes = (schema: unknown): schema is JSONSchemaMultipleBasicTypes => typeof schema === 'object' && schema !== null && 'type' in schema && Array.isArray(schema['type']);
export const isSchemaEnum = (schema: unknown): schema is JSONSchemaObjectValueEnum => typeof schema === 'object' && schema !== null && 'enum' in schema;
export const isSchemaConst = (schema: unknown): schema is JSONSchemaObjectValueConst => typeof schema === 'object' && schema !== null && 'const' in schema;
export const isSchemaObject = (schema: unknown): schema is JSONSchemaObject => typeof schema === 'object' && schema !== null && 'type' in schema && schema['type'] === 'object';
export const isEmptyObject = (schema: JSONSchema | {}): schema is {} => typeof schema === 'object' && Object.keys(schema).filter(key => {
  return key !== '$schema';
}).length === 0;
