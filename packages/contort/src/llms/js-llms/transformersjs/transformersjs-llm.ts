/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import {
  PreTrainedModel,
  PreTrainedTokenizer,
} from "@xenova/transformers";
import { GrammarLogitsProcessor, } from "./grammar-logits-processor.js";
import type {
  Beam,
  GenerateFn,
  TransformersJSOpts,
  TokenizeFn,
  TransformersJSExecuteOptions,
  TransformersJSModelDefinition,
} from "./types.js";
import { GrammarParser, } from "../../../utils/grammar-parser/index.js";
import { GetToken, } from "../../../utils/grammar-parser/types.js";
import { isModelDefinitionPipeline, isTextGenerationPipeline, } from "./type-guards.js";

// export const DEFAULT_TEMPERATURE = 0.5;
export const DEFAULT_TEMPERATURE = 0.0;

export class TransformersJSLLM {
  grammarParser: GrammarParser;
  get tokenizer(): Promise<PreTrainedTokenizer> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return new Promise<PreTrainedTokenizer>(async (resolve) => {
      const modelDefinition = await this.modelDefinition;
      if (isTextGenerationPipeline(modelDefinition)) {
        resolve(modelDefinition.tokenizer);
      } else if (isModelDefinitionPipeline(modelDefinition)) {
        const pipeline = await modelDefinition.pipeline;
        resolve(pipeline.tokenizer);
      } else {
        resolve(modelDefinition.tokenizer);
      }
    });
  }

  get model(): Promise<PreTrainedModel> {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return new Promise<PreTrainedModel>(async (resolve) => {
      const modelDefinition = await this.modelDefinition;
      if (isTextGenerationPipeline(modelDefinition)) {
        resolve(modelDefinition.model);
      } else if (isModelDefinitionPipeline(modelDefinition)) {
        const pipeline = await modelDefinition.pipeline;
        resolve(pipeline.model);
      } else {
        resolve(modelDefinition.model);
      }
    });
  }

  constructor(public modelDefinition: TransformersJSModelDefinition) {
    void this.setup();
  }

  setup = async () => {
    const tokenizer = await this.tokenizer;
    const stopTokenId = tokenizer.model.convert_tokens_to_ids([tokenizer.getToken('eos_token'),])[0];
    const vocabSize = tokenizer.model.vocab.length;
    const getToken: GetToken = tokenId => tokenizer.decode([tokenId,]);

    this.grammarParser = new GrammarParser({
      vocabSize,
      stopTokenId,
      getToken,
    });
  };

  async execute({
    prompt,
    grammar,
    callback,
    llmOpts = {},
    // signal,
  }: TransformersJSExecuteOptions) {
    const [model, tokenizer,] = await Promise.all([this.model, this.tokenizer,]);
    const callbackFunction = callback ? (beams: Beam[]) => {
      for (const beam of beams) {
        const outputTokenIds = beam.output_token_ids;
        const decoded = tokenizer.decode(outputTokenIds);
        callback({
          partial: decoded,
          chunk: beam,
        });
      }
    } : undefined;
    const generate_kwargs: TransformersJSOpts = {
      temperature: DEFAULT_TEMPERATURE,
      ...llmOpts,

      callback_function: callbackFunction,
    };

    if (grammar) {
      this.grammarParser.initialize(grammar);
    }
    const logitsProcessor = grammar ? new GrammarLogitsProcessor(prompt, this.grammarParser, tokenizer) : undefined;

    // The type definitions for Transformers.js functions appear as anys, which get reported as bugs
    const { input_ids, attention_mask, } = (tokenizer as TokenizeFn)(prompt);

    // The type definitions for Transformers.js functions appear as anys, which get reported as bugs
    const generate = model.generate.bind(model) as GenerateFn;

    const outputTokenIds = await generate(input_ids, generate_kwargs, logitsProcessor, {
      inputs_attention_mask: attention_mask,
    });
    const decoded = tokenizer.decode(outputTokenIds[0], {
      skip_special_tokens: true,
    });
    return decoded.slice(prompt.length);
  };
};

