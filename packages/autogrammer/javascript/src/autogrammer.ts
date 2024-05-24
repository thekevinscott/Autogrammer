import Contortionist, {
  type ExternalExecuteOptions,
  type ModelDefinition,
  type ModelProtocol,
} from 'contort';
import type {
  ConstructorOptions,
  SupportedLanguage,
} from './types.js';
import { buildPrompt, } from './utils.js';
import {
  isSupportedLanguage,
} from './type-guards.js';
import {
  SUPPORTED_LANGUAGES,
} from './constants.js';
import { JSONSchema, } from 'json2gbnf';
import SQL2GBNF from 'sql2gbnf';
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
    if (!isSupportedLanguage(this.#language)) {
      throw new Error(`Unsupported language: ${this.#language as string}. Only one of ${JSON.stringify(SUPPORTED_LANGUAGES)} are supported.`);
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

  get model(): Contortionist<ModelProtocol> {
    if (!this.#contortionist) {
      throw new Error('No model');
      // const model = webllm.CreateEngine("Phi1.5-q4f32_1-1k", {
      //   initProgressCallback: console.log,
      // });
      // // "Llama-3-8B-Instruct-q4f32_1",
      // // const model = pipeline('text-generation', 'Xenova/WizardCoder-1B-V1.0');
      // this.#contortionist = new Contortionist({
      //   model,
      // });
    }
    return this.#contortionist;
  }

  public async execute(
    prompt: string,
    {
      // languageOptions,
      modelOptions = {},
    }: {
      languageOptions?: JSONSchema,
      modelOptions?: ExternalExecuteOptions<ModelProtocol, boolean>,
    },
  ): Promise<string> {
    const contortionist = this.model;
    contortionist.grammar = SQL2GBNF({
      whitespace: 'succinct',
      case: 'upper',
    });
    // contortionist.grammar = JSON2GBNF(languageOptions, {
    //   fixedOrder: false,
    //   whitespace: 1,
    // });
    if (!contortionist.grammar) {
      throw new Error('no grammar');
    }
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
