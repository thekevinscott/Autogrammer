import Contortionist, { ExternalExecuteOptions, ModelProtocol, } from 'contort';
import { getGrammar, } from './grammars/index.js';
import { ConstructorOptions, SUPPORTED_LANGUAGES, SupportedLanguage, isSupportedLanguage, } from './types.js';
import { buildPrompt, } from './utils.js';
import { Variables, } from './grammars/get-grammar.js';

export class Autogrammer<L extends SupportedLanguage> {
  language: L;
  contortionist: Contortionist<ModelProtocol>;

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
  constructor({ language, model, }: ConstructorOptions<L>) {
    if (!isSupportedLanguage(language)) {
      throw new Error(`Unsupported language: ${language as string}. Only one of ${JSON.stringify(SUPPORTED_LANGUAGES)} are supported.`);
    }
    this.language = language;
    this.contortionist = new Contortionist({
      model,
      grammar: getGrammar<L>(language),
    });
  }

  public async synthesize(
    prompt: string,
    {
      languageOptions,
      modelOptions = {},
    }: {
      languageOptions?: Variables<L>,
      modelOptions?: ExternalExecuteOptions<ModelProtocol, boolean>,
    },
  ): Promise<string> {
    if (languageOptions !== undefined) {
      if (this.language === 'sql') {
        this.contortionist.grammar = getGrammar<'sql'>(this.language, languageOptions);
        // console.log(this.contortionist.grammar);
        // } else if (this.language === 'json') {
        //   const grammar = await compile(languageOptions, 'Root');
        //   console.log(grammar);
        //   this.contortionist.grammar = grammar;
      } else {
        throw new Error('I dont know this one');
      }
    }
    const builtPrompt = buildPrompt(prompt, this.language);
    return await this.contortionist.execute(builtPrompt, {
      ...modelOptions,
    });
  };

  abort = () => {
    this.contortionist.abort();
  };
}
