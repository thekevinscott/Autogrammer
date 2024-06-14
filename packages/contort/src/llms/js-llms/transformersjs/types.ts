import type {
  Tensor as _Tensor,
  PreTrainedModel,
  PreTrainedTokenizer,
  TextGenerationConfig,
  TextGenerationPipeline,
} from "@xenova/transformers";
import type {
  Callback as _Callback,
  InternalExecuteOptions,
} from "../../../types.js";
import type { GrammarLogitsProcessor, } from "./grammar-logits-processor.js";

/** Re-type Transformers.js objects, since otherwise they throw errors */
export type Tensor<T = BigInt64Array> = {
  data: T;
} & Omit<_Tensor, 'data'>;
export type TransformersJSOpts = TextGenerationConfig & {
  callback_function?: (beams: Beam[]) => void;
};
export type GenerateFn = (
  inputIds: Tensor,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  config: TransformersJSOpts,
  logitsProcessor: GrammarLogitsProcessor,
  options: { inputs_attention_mask: null | Tensor },
) => Promise<OutputTokenIds>;
export type TokenizeFn = (
  text: string | string[],
  options?: {
    text_pair?: string | string[];
    padding?: boolean | 'max_length';
    add_special_tokens?: boolean;
    truncation?: boolean;
    max_length?: number;
    return_tensor?: boolean;
  }) => GenerationOutput;

export interface Beam {
  attention_mask: Tensor;
  done: boolean;
  id: number;
  input: Tensor;
  model_input_ids: Tensor;
  num_output_tokens: number;
  output_token_ids: number[];
  prev_model_outputs: {
    logits: Tensor;
    past_key_values: Record<string, Tensor>;
  };
  score: number;
}
// export interface DecodeArgs {
//   skip_special_tokens?: boolean; clean_up_tokenization_spaces?: boolean
// }
// export type BatchDecode = (batch: number[][] | Tensor, decode_args?: DecodeArgs) => string[];
// export type Decode = (token_ids: number[] | Tensor, decode_args?: DecodeArgs) => string;

/** Internal types */
export type TransformersJSPrompt = string;
export type Callback = _Callback<'transformers.js', null>;
export interface TransformersJSExecuteOptions extends Omit<InternalExecuteOptions, 'stream'> {
  prompt: TransformersJSPrompt;
  callback: Callback;
  llmOpts?: TransformersJSOpts;
}

export interface TransformersJSError {
  code: number;
  message: string;
  type: string;
}


export type TransformersJSResponse = Beam;
// export interface TransformersJSResponse {
//   inputTokens: number[];
//   logits: Tensor;
// }

export interface GenerationOutput {
  input_ids: Tensor;
  attention_mask: Tensor;
}

export type OutputTokenIds = number[][];

export interface BaseModelDefinition {
  protocol: 'transformers.js';
}

export type Pipeline = TextGenerationPipeline | Promise<TextGenerationPipeline>;

export interface ModelDefinitionPipeline extends BaseModelDefinition {
  pipeline: Pipeline;
}

export interface ModelDefinitionModelAndTokenizer extends BaseModelDefinition {
  model: PreTrainedModel | Promise<PreTrainedModel>;
  tokenizer: PreTrainedTokenizer | Promise<PreTrainedTokenizer>;
}

export type TransformersJSModelDefinition = Pipeline | ModelDefinitionPipeline | ModelDefinitionModelAndTokenizer;
