/* eslint-disable @typescript-eslint/ban-types */

export type AddRule = (rule: string, symbolName?: string) => string;
export type GetConst = (key: string, opts?: { left?: boolean; right?: boolean }) => string;

export interface SchemaOpts {
  fixedOrder?: boolean;
  whitespace?: number;
}
