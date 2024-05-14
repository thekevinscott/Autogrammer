import type {
  SchemaOpts,
} from './types.js';
import { GrammarBuilder, } from 'gbnf';

console.log('GrammarBuilder', GrammarBuilder);
export class Grammar extends GrammarBuilder {
  fixedOrder: boolean;

  constructor({ fixedOrder = false, ...opts }: SchemaOpts = {}) {
    super(opts);
    this.fixedOrder = fixedOrder;
  }
}
