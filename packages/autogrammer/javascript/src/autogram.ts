import {
  GBNFRule,
  _,
} from "gbnf/builder";
// import { Autogrammer, } from "./autogrammer.js";
import Contortionist, {
  ExternalExecuteOptions,
} from "contort";
import { getGrammar, } from "./get-grammar.js";
import { buildPrompt, } from "./utils.js";
import { isSupportedSyntax, } from "./type-guards.js";
import { loadTransformersJS, } from "./load-library.js";
import type {
  SQLSyntaxOptions as _SQLSyntaxOptions,
  JSONSyntaxOptions as _JSONSyntaxOptions,
} from "./types.js";
import type {
  Pipeline as _Pipeline,
} from "@xenova/transformers";

const DEFAULT_MODEL = 'Xenova/gpt2';

// type GenerativeArgs = Parameters<typeof Autogrammer.prototype.generate>[1];
type GBNFRuleFn = (underscore: typeof _) => GBNFRule;
interface JSONSyntaxOptions extends _JSONSyntaxOptions {
  syntax: 'json';
}
interface SQLSyntaxOptions extends _SQLSyntaxOptions {
  syntax: 'sql';
}
const isSyntaxOptions = (opts: unknown): opts is JSONSyntaxOptions | SQLSyntaxOptions => {
  return !(opts instanceof GBNFRule) && typeof opts === 'object' && 'syntax' in opts && ['json', 'sql',].includes((opts as any).syntax);
};
type SyntaxOptions = string | GBNFRule | GBNFRuleFn | JSONSyntaxOptions | SQLSyntaxOptions;
const getSyntax = (syntaxDefinition?: SyntaxOptions): undefined | string | GBNFRule => {
  if (typeof syntaxDefinition === 'string') {
    if (isSupportedSyntax(syntaxDefinition)) {
      return getGrammar(syntaxDefinition as 'json' | 'sql');
    }
  }

  if (isSyntaxOptions(syntaxDefinition)) {
    const {
      syntax,
      ...llmOpts
    } = syntaxDefinition;
    return getGrammar(syntax, llmOpts);
  }

  if (typeof syntaxDefinition === 'function') {
    return syntaxDefinition(_);
  }

  return syntaxDefinition;
};

type Pipeline = _Pipeline | Promise<_Pipeline>;
interface LLMOptsWithExplicitModel extends ExternalExecuteOptions<'transformers.js', true> {
  model?: Pipeline;
  max_new_tokens?: number;
  maximumDepth?: number;
}
type LLMOpts = Pipeline | LLMOptsWithExplicitModel;

const isLLMOptsWithExplicitModel = (opts: unknown): opts is LLMOptsWithExplicitModel => {
  return typeof opts === 'object' && !(opts instanceof Promise);
};

const getOpts = (syntaxOrLLMOpts?: SyntaxOptions | LLMOpts, llmOpts?: LLMOpts): { syntaxOpts?: SyntaxOptions, llmOpts: LLMOptsWithExplicitModel } => {
  if (llmOpts === undefined) {
    return {
      syntaxOpts: syntaxOrLLMOpts as SyntaxOptions,
      llmOpts: {},
    };
  }

  if (isLLMOptsWithExplicitModel(llmOpts)) {
    return {
      syntaxOpts: syntaxOrLLMOpts as SyntaxOptions,
      llmOpts,
    };
  }

  return {
    syntaxOpts: syntaxOrLLMOpts as SyntaxOptions,
    llmOpts: {
      model: llmOpts,
    },
  };
};

type AutogramReturnType = Promise<string>;
interface Autogram {
  (prompt: string): AutogramReturnType;
  (prompt: string, syntax: SyntaxOptions): AutogramReturnType;
  (prompt: string, llmOpts: LLMOpts): AutogramReturnType;
  (prompt: string, syntax: SyntaxOptions, llmOpts: LLMOpts): AutogramReturnType;
}
export const autogram: Autogram = async (prompt: string, syntaxOrLLMOpts?: SyntaxOptions | LLMOpts, _llmOpts?: LLMOpts) => {
  if (!prompt) {
    throw new Error('Prompt is required.');
  }
  const {
    syntaxOpts: syntax,
    llmOpts,
  } = getOpts(syntaxOrLLMOpts, _llmOpts);
  const grammar = getSyntax(syntax);

  const model = llmOpts.model || await loadTransformersJS().then(async ({ pipeline, }) => {
    const origWarn = console.warn;
    console.warn = () => { };
    const model = await pipeline('text-generation', DEFAULT_MODEL);
    console.warn = origWarn;
    return model;
  });

  const contortionist = new Contortionist({
    model,
    grammar,
  });

  const builtPrompt = buildPrompt(prompt, grammar);

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    model: _model,
    callback,
    ...llmOptsWithoutModel
  } = llmOpts;

  return contortionist.execute(builtPrompt, {
    callback,
    llmOpts: {
      // maximumDepth: 6,
      // maximumDepth: 1,

      do_sample: true,
      top_k: 5,
      // max_new_tokens: 1,
      ...llmOptsWithoutModel,
    },
  });
};
