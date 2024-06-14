import { buildContortionist } from '../../utils/build-contortionist.js';
import { configureNonStreamingServer as _configureNonStreamingServer } from '../../utils/bootstrap-server-mock.js';
import { configureStreamingServer as _configureStreamingServer } from '../../utils/bootstrap-server-mock.js';
import { makeMockPipeline } from '../../__mocks__/mock-transformersjs.js';
import { setLogLevel } from 'testeroni';

import Contortionist from 'contort';
import gpt2Vocab from '../../__fixtures__/gpt2-vocab.json';
import {
  TextGenerationPipeline,
} from '@xenova/transformers';
import { getFakePipeline } from '../../__fixtures__/models/fake-pipeline.js';
import { _ } from 'gbnf/builder';
// import { loadModel } from '../../__fixtures__/models/load.js';

setLogLevel('warn')

describe('TransformersJS', async () => {
  let model: TextGenerationPipeline;
  beforeAll(async () => {
    const [_model] = await Promise.all([
      getFakePipeline(),
      // loadModel('TinyLLama-v0'),
      buildContortionist(),
    ]);
    model = _model;
  });

  test('it should return a response', async () => {
    const contortionist = new Contortionist({
      model,
    });

    const result = await contortionist.execute('abc');

    expect(result).toEqual('bcd');
  });

  test('it should return a response for an awaitable pipeline', async () => {
    const awaitableModel = Promise.resolve(model);

    const contortionist = new Contortionist({
      model: awaitableModel,
    });
    const result = await contortionist.execute('abc');
    expect(result).toEqual('bcd');
  });

  test('it should call back', async () => {
    const contortionist = new Contortionist({
      model,
    });
    const callback = vi.fn();
    await contortionist.execute('abc', {
      callback,
    });
    expect(callback).toHaveBeenCalledTimes(3);
  });

  // I don't think stopping criteria is supported for v2
  // test('it should be able to abort', async () => {
  //   const promise = new Promise((resolve) => {
  //   });
  //   const generate = async (prompt: number[], {
  //     callback_function,
  //   }) => {
  //     callback_function([{
  //       output_token_ids: [prompt[0] + 1],
  //     }]);

  //     contortionist.abort();
  //     await promise;
  //   };
  //   const model = getFakePipeline({
  //     generate,
  //   });
  //   const contortionist = new Contortionist({
  //     model,
  //   });

  //   const callback = vi.fn().mockImplementation(() => {
  //     contortionist.abort();
  //   });
  //   await contortionist.execute('abc', {
  //     callback,
  //   });
  //   expect(callback).toHaveBeenCalledTimes(1);
  // }, 100);

  // test('it should leverage logits processor', async () => {
  //   const contortionist = new Contortionist({
  //     model,
  //     grammar: _`
  //       "foo" 
  //     `.compile(),
  //   });
  //   const result = await contortionist.execute('abc');
  //   expect(result).toEqual('foo');
  // });
});
