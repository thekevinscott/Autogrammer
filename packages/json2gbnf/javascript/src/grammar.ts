import type {
  SchemaOpts,
} from './types.js';
import { GrammarBuilder, } from 'gbnf/builder';

export class Grammar extends GrammarBuilder {
  fixedOrder: boolean;

  constructor({ fixedOrder = false, ...opts }: SchemaOpts = {}) {
    super(opts);
    this.fixedOrder = fixedOrder;
  }
}
