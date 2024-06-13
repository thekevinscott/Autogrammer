import {
  type TextGenerationPipeline
} from "@xenova/transformers";
import { GenerateFn } from "../../../src/llms/js-llms/transformersjs/types.js";
import { GrammarLogitsProcessor } from "../../../src/llms/js-llms/transformersjs/grammar-logits-processor.js";

export const getFakePipeline = ({
  generate,
}: {
  generate?: any,
} = {}) => {
  const fakeModel = async (prompt: string, kwargs?: Record<string, any>) => {
    return 'foobar';
  }

  const fakeTokenizer = (prompt: string) => {
    return { input_ids: prompt.split('').map(char => char.charCodeAt(0)), attention_mask: [], }
  }
  // fakeTokenizer.prototype.model = fakeModel;

  fakeTokenizer.decode = (tokenIds: number[]) => tokenIds.map(tokenId => String.fromCharCode(tokenId)).join('');
  fakeModel.tokenizer = fakeTokenizer;
  fakeTokenizer.model = fakeModel;
  fakeModel.vocab = Array(256).fill(0).map((_, i) => String.fromCharCode(i));
  fakeModel.generate = generate ? generate : async (prompt: number[], {
    callback_function,
  }: Record<string, any> = {}, logitsProcessor: GrammarLogitsProcessor, options: Record<string, any> = {}) => {
    const output_token_ids = [];
    for (let i = 0; i < prompt.length; i++) {
      const tokenId = prompt[i] + 1;
      output_token_ids.push(tokenId);
      if (callback_function) {
        callback_function([{
          output_token_ids,
        }])
      }
    }
    return [[
      ...prompt,
      ...output_token_ids,
    ]];
  };
  fakeTokenizer.getToken = (token: string) => token;
  fakeModel.convert_tokens_to_ids = (tokens: string[]) => tokens.map(token => token.charCodeAt(0));

  const fakeTextGenerationPipeline = () => {

  };
  fakeTextGenerationPipeline.model = fakeModel;
  fakeTextGenerationPipeline.tokenizer = fakeTokenizer;

  const fakePipeline = async (task?: 'text-generation', model?: string) => fakeTextGenerationPipeline as unknown as TextGenerationPipeline;
  return fakePipeline();
};
