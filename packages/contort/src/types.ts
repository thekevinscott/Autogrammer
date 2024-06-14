import {
  type LlamaCPPPrompt,
  type LlamaCPPResponse,
} from "./llms/endpoint-llms/llama-cpp/types.js";
import {
  type LlamafilePrompt,
  type NonStreamingLlamafileResponse,
  type StreamingLlamafileResponse,
} from "./llms/endpoint-llms/llamafile/types.js";
import {
  TransformersJSOpts as TransformersJSOpts,
  TransformersJSModelDefinition,
  TransformersJSResponse,
} from "./llms/js-llms/transformersjs/types.js";
import {
  WebLLMModelDefinition,
  WebLLMOpts,
  WebLLMResponse,
} from "./llms/js-llms/web-llm/types.js";
import {
  BidirectionalMap,
} from "./utils/bidirectional-map.js";

export type ModelProtocol = 'llama.cpp' | 'llamafile' | 'transformers.js' | 'web-llm';

export interface ModelProtocolDefinition<M extends ModelProtocol> {
  endpoint: string;
  protocol: M;
}

export type ModelDefinition<M extends ModelProtocol | undefined> =
  TransformersJSModelDefinition
  | WebLLMModelDefinition
  | Promise<WebLLMModelDefinition>
  | ModelProtocolDefinition<M>;
export type Grammar = string | GBNFRule;

export interface InternalExecuteOptions {
  n: number;
  grammar?: string;
  stream: boolean;
  signal: AbortSignal;
}
export interface ExternalExecuteOptions<M extends ModelProtocol, S extends boolean> {
  stream?: S;
  callback?: Callback<M, S>;
  signal?: AbortSignal;
  llmOpts?: LLMOpts<M>;
}

export type LLMOpts<M extends ModelProtocol> =
  M extends 'transformers.js'
  ? TransformersJSOpts
  : M extends 'web-llm'
  ? WebLLMOpts
  : Record<string, unknown>;

export interface ConstructorOptions<M extends ModelProtocol | undefined = undefined> {
  grammar?: Grammar;
  model?: ModelDefinition<M>;
}

export type Prompt<M extends ModelProtocol> = M extends 'llama.cpp'
  ? LlamaCPPPrompt
  : M extends 'llamafile'
  ? LlamafilePrompt
  : string;

export type Callback<M extends ModelProtocol, S extends boolean | undefined> = (obj: {
  partial: string;
  chunk: M extends 'llamafile' ?
  (S extends true ? StreamingLlamafileResponse : NonStreamingLlamafileResponse)
  : M extends 'llama.cpp' ?
  LlamaCPPResponse
  : M extends 'transformers.js' ?
  TransformersJSResponse
  : M extends 'web-llm' ?
  WebLLMResponse
  : never;
}) => void;

export interface LLMInterface {
  execute<S extends boolean>(obj: {
    prompt: Prompt<ModelProtocol>;
    stream: boolean;
    callback?: Callback<ModelProtocol, S>;
    grammar?: string;
    signal: AbortSignal;
    llmOpts?: LLMOpts<ModelProtocol>;
  }): Promise<string>;
}

export type Vocab = BidirectionalMap<number, string>;
