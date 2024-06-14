import type {
  TextGenerationPipeline,
} from "@xenova/transformers";
import type {
  BaseModelDefinition,
  ModelDefinitionModelAndTokenizer,
  ModelDefinitionPipeline,
} from "./types.js";

export const isTextGenerationPipeline = (model: unknown): model is TextGenerationPipeline => {
  // TODO: Can this be tightened without relying on "instance"?
  // If so, we could remove the hard dependency on transformers at runtime and load it dynamically
  // return model instanceof TextGenerationPipeline;
  return typeof model === 'function';
};

const isModelDefinitionTransformersJS = (model: unknown): model is BaseModelDefinition => {
  return typeof model === 'object' && 'protocol' in model && model.protocol === 'transformers.js';
};

export const isModelDefinitionPipeline = (model: unknown): model is ModelDefinitionPipeline => {
  return isModelDefinitionTransformersJS(model) && 'pipeline' in model;
};

export const isModelDefinitionModelAndTokenizer = (model: unknown): model is ModelDefinitionModelAndTokenizer => {
  return isModelDefinitionTransformersJS(model) && 'model' in model && 'tokenizer' in model;
};

