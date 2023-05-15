import type { SchemaOpts as _SchemaOpts, } from 'gbnf';
/* eslint-disable @typescript-eslint/ban-types */

export type AddRule = (rule: string, symbolName?: string) => string;
export type GetConst = (key: string, opts?: { left?: boolean; right?: boolean }) => string;

export type WhitespaceKind = 'succinct' | 'verbose' | 'default';
export type CaseKind = 'lower' | 'upper' | 'any';
export interface SchemaOpts extends Omit<_SchemaOpts, 'whitespace'> {
  whitespace?: WhitespaceKind;
  case?: CaseKind;
}
