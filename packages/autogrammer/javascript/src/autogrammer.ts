import Contortionist, {
  type ExternalExecuteOptions,
  type ModelDefinition,
  type ModelProtocol,
} from 'contort';
import type * as transformers from '@xenova/transformers';
import type {
  ConstructorOptions,
  LanguageOptions,
  SupportedLanguage,
} from './types.js';
import { buildPrompt, } from './utils.js';
import {
  isSupportedLanguage,
} from './type-guards.js';
import {
  SUPPORTED_LANGUAGES,
} from './constants.js';
import { getGrammar, } from './get-grammar.js';
// import * as webllm from "@mlc-ai/web-llm";

export class Autogrammer {
  #language?: SupportedLanguage;
  #contortionist?: Contortionist<ModelProtocol>;

  /**
   * Instantiates an instance of Autogrammer.
   * 
   * ```javascript
   * import Autogrammer from 'autogrammer';
   * 
   * const synth = new Autogrammer({
   *   language: 'javascript',
   *   model: {},
   * });
   * ```
   * 
   * @returns an instance of a Autogrammer class.
   */
  constructor({ language, model, }: ConstructorOptions<SupportedLanguage>) {
    if (language !== undefined) {
      this.language = language;
    }
    if (model) {
      this.model = model;
    }
  }

  get language(): SupportedLanguage {
    if (this.#language === undefined) {
      throw new Error('Language not set.');
    }
    return this.#language;
  }
  set language(language: SupportedLanguage) {
    if (!isSupportedLanguage(language)) {
      throw new Error(`Unsupported language: ${language as string}. Only one of ${JSON.stringify(SUPPORTED_LANGUAGES)} are supported.`);
    }
    this.#language = language;
  }

  set model(model: ModelDefinition<ModelProtocol>) {
    this.#contortionist = new Contortionist({
      model,
    });
  }


  get pipeline() {
    return import('https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js')
      .then((module: typeof transformers) => module.pipeline);
  }

  get model(): Promise<Contortionist<ModelProtocol>> | Contortionist<ModelProtocol> {
    if (!this.#contortionist) {
      return this.pipeline.then(pipeline => {
        this.#contortionist = new Contortionist({
          model: pipeline('text-generation', 'Xenova/WizardCoder-1B-V1.0'),
        });
        return this.#contortionist;
      });
      // // import { pipeline, } from '@xenova/transformers'
      // throw new Error('No model');
      // // const model = webllm.CreateEngine("Phi1.5-q4f32_1-1k", {
      // //   initProgressCallback: console.log,
      // // });
      // // // "Llama-3-8B-Instruct-q4f32_1",
      // // // const model = pipeline('text-generation', 'Xenova/WizardCoder-1B-V1.0');
      // // this.#contortionist = new Contortionist({
      // //   model,
      // // });
    }
    return this.#contortionist;
  }

  public async execute(
    prompt: string,
    {
      languageOptions,
      modelOptions = {},
    }: {
      languageOptions?: LanguageOptions<SupportedLanguage>;
      modelOptions?: ExternalExecuteOptions<ModelProtocol, boolean>,
    } = {},
  ): Promise<string> {
    const contortionist = await this.model;
    contortionist.grammar = getGrammar(this.language, languageOptions);
    const builtPrompt = buildPrompt(prompt, this.language);
    return await contortionist.execute(builtPrompt, {
      ...modelOptions,
    });
  };

  abort = () => {
    const contortionist = this.#contortionist;
    if (!contortionist) {
      throw new Error('No model');
    }
    contortionist.abort();
  };
}
