/* eslint-disable @typescript-eslint/ban-types */

export interface JSONSchemaObjectValueEnum {
  enum: (string | null)[];
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

interface BaseJSONSchemaArray {
  type: 'array';
  prefixItems?: unknown;
  unevaluatedItems?: unknown;
  contains?: unknown;
  minContains?: number;
  maxContains?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
}

export type PrimitiveType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';
export interface JSONSchemaArrayMultipleItemType extends BaseJSONSchemaArray {
  items: {
    type: PrimitiveType[];
  };
}
export interface JSONSchemaArraySingularItemType extends BaseJSONSchemaArray {
  items: {
    type: PrimitiveType;
  };
}
export interface JSONSchemaArrayBooleanItem extends BaseJSONSchemaArray {
  items: boolean;
}
export interface JSONSchemaArrayNoItemType extends BaseJSONSchemaArray {
  items?: undefined; // _no_ type is a valid type of array
};
export type JSONSchemaArray =
  JSONSchemaArrayNoItemType |
  JSONSchemaArrayMultipleItemType |
  JSONSchemaArraySingularItemType |
  JSONSchemaArrayBooleanItem;
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

export type ParseTypeArg = JSONSchemaArray | JSONSchemaBoolean | JSONSchemaNull | JSONSchemaNumber | JSONSchemaString | JSONSchemaObject;

export type AddRule = (rule: string, symbolName?: string) => string;
export type GetConst = (key: string, opts?: { left?: boolean; right?: boolean }) => string;

export interface SchemaOpts {
  fixedOrder?: boolean;
  whitespace?: number;
}
