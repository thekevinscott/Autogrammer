/* eslint-disable @typescript-eslint/ban-types */
import type {
  JSONSchema,
  JSONSchemaArray,
  JSONSchemaArrayBooleanItem,
  JSONSchemaArrayMultipleItemType,
  JSONSchemaArrayNoItemType,
  JSONSchemaArraySingularItemType,
  JSONSchemaMultipleBasicTypes,
  JSONSchemaObject,
  JSONSchemaObjectValueConst,
  JSONSchemaObjectValueEnum,
} from "./types.js";

const isObject = (schema: unknown): schema is Record<string, unknown> => typeof schema === 'object' && schema !== null;

export const isSchemaMultipleBasicTypes = (
  schema: unknown
): schema is JSONSchemaMultipleBasicTypes => isObject(schema) && 'type' in schema && Array.isArray(schema['type']);
export const isSchemaEnum = (
  schema: unknown
): schema is JSONSchemaObjectValueEnum => isObject(schema) && 'enum' in schema;
export const isSchemaConst = (
  schema: unknown
): schema is JSONSchemaObjectValueConst => isObject(schema) && 'const' in schema;
export const isSchemaObject = (
  schema: unknown
): schema is JSONSchemaObject => isObject(schema) && 'type' in schema && schema['type'] === 'object';
export const isEmptyObject = (
  schema: JSONSchema | {}
): schema is {} => typeof schema === 'object' && Object.keys(schema).filter(key => {
  return key !== '$schema';
}).length === 0;
export const hasDollarSchemaProp = (
  schema: unknown
): schema is {
  $schema: string;
} => isObject(schema) && '$schema' in schema && schema['$schema'] !== undefined;
// export type JSONSchemaArray = (
//   BaseJSONSchemaArray | // _no_ type is a valid type of array
//   JSONSchemaArrayMultipleItemType |
//   JSONSchemaArraySingularItemType | 
//   JSONSchemaArrayBooleanItem
// ) & BaseJSONSchemaArray;

export const isSchemaArrayWithoutItems = (
  schema: JSONSchemaArray
): schema is JSONSchemaArrayNoItemType => !('items' in schema) || schema.items === undefined;
export const isSchemaArrayWithBooleanItemsType = (
  schema: JSONSchemaArray
): schema is JSONSchemaArrayBooleanItem => 'items' in schema && typeof schema.items === 'boolean';
export const isSchemaArraySingularItemsType = (
  schema: JSONSchemaArray
): schema is JSONSchemaArraySingularItemType => 'items' in schema && typeof schema.items === 'object' && Array.isArray(schema.items.type) === false;
export const isSchemaArrayMultipleItemsType = (
  schema: JSONSchemaArray
): schema is JSONSchemaArrayMultipleItemType => 'items' in schema && typeof schema.items === 'object' && Array.isArray(schema.items.type) === true;
