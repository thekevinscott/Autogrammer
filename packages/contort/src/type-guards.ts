import type {
  ModelProtocol,
  ModelDefinition,
  ModelProtocolDefinition,
} from "./types.js";
import type {
  TransformersJSModelDefinition,
} from "./llms/js-llms/transformersjs/types.js";
import type {
  WebLLMModelDefinition,
} from "./llms/js-llms/web-llm/types.js";
import {
  isModelDefinitionModelAndTokenizer,
  isModelDefinitionPipeline,
  isTextGenerationPipeline,
} from "./llms/js-llms/transformersjs/type-guards.js";

export function modelIsProtocolDefinition<M extends ModelProtocol>(model: ModelDefinition<M>): model is ModelProtocolDefinition<M> {
  return typeof model === 'object' && 'endpoint' in model && model.endpoint !== undefined;
};

export function isProtocol<M extends ModelProtocol>(protocol: M, model: ModelProtocolDefinition<ModelProtocol>): model is ModelProtocolDefinition<M> {
  return modelIsProtocolDefinition(model) && model.protocol === protocol;
}

export function isTransformersJSModelDefinition<M extends ModelProtocol>(model: ModelDefinition<M>): model is TransformersJSModelDefinition {
  return isTextGenerationPipeline(model) || isModelDefinitionPipeline(model) || isModelDefinitionModelAndTokenizer(model);
};

export function isWebLLMModelDefinition<M extends ModelProtocol>(model: ModelDefinition<M>): model is WebLLMModelDefinition {
  return typeof model === 'object' && 'pipeline' in model && 'tokenizer' in model['pipeline'];
};
