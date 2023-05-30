/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  GrammarBuilder,
} from './Grammar-Builder.js';
import {
  join,
  joinWith,
  joinPipe,
} from './utils/join.js';
import * as rule from '../builder-v2/index.js';
import * as grammarKeys from './constants/grammar-keys.js';
import { getConstRule, } from './utils/get-const-rule.js';
import { getConstKey, } from './utils/get-const-key.js';
import { getID, } from './utils/get-id.js';
import { buildGrammar, } from './utils/build-grammar.js';
import { GLOBAL_CONSTANTS, } from './constants/constants.js';

module.exports = GrammarBuilder;
module.exports.rule = rule;
module.exports.join = join;
module.exports.joinWith = joinWith;
module.exports.joinPipe = joinPipe;
module.exports.keys = grammarKeys;
module.exports.getConstRule = getConstRule;
module.exports.getConstKey = getConstKey;
module.exports.getID = getID;
module.exports.buildGrammar = buildGrammar;
module.exports.GLOBAL_CONSTANTS = GLOBAL_CONSTANTS;
