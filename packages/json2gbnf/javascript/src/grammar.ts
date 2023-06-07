import type {
  JSON2GBNFOpts,
} from './types.js';
import { GrammarBuilder, } from 'gbnf/builder-v1';

export class Grammar extends GrammarBuilder {
  fixedOrder: boolean;

  constructor({ fixedOrder = false, ...opts }: JSON2GBNFOpts = {}) {
    super(opts);
    this.fixedOrder = fixedOrder;
  }
}
