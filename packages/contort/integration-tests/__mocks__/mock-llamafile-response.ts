import type {
  LlamafileResponse,
} from "contort";

export const makeNonStreamingLlamafileResponse = ({ content }: Partial<LlamafileResponse> = {}): LlamafileResponse => ({
  created: 123,
  id: 'mock_id',
  model: 'llamafile',
  object: 'response',
  choices: [{
    finish_reason: '',
    index: 0,
    message: {
      content,
      role: 'user',
    },
  }],
});

export const makeStreamingLlamafileResponse = ({ content }: Partial<LlamafileResponse> = {}): LlamafileResponse => ({
  created: 123,
  id: 'mock_id_stream',
  model: 'llamafile-streaming',
  object: 'response',
  choices: [{
    finish_reason: 'streaming',
    index: 0,
    delta: {
      content,
    },
  }],
});

