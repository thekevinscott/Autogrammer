import Contortionist from "contort";
import { vi, } from "vitest";
import { setLogLevel, } from 'testeroni';
import { makePromise } from "../../utils/make-promise.js";
import {
  configureNonStreamingServer as _configureNonStreamingServer,
  configureStreamingServer as _configureStreamingServer,
} from "../../utils/bootstrap-server-mock.js";
import MockLLMAPI from "../../utils/mock-llm-api.js";
import {
  makeNonStreamingLlamafileResponse,
  makeStreamingLlamafileResponse,
} from "../../__mocks__/mock-llamafile-response.js";
import { buildContortionist } from "../../utils/build-contortionist.js";

setLogLevel('warn')
const configureNonStreamingServer = (content: string) => _configureNonStreamingServer(content, makeNonStreamingLlamafileResponse);
const configureStreamingServer = (content: string, n: number) => _configureStreamingServer(content, n, makeStreamingLlamafileResponse);

describe('llamafile', async () => {
  let _mockLLMAPI: MockLLMAPI;
  beforeAll(() => buildContortionist());

  afterEach(async () => {
    await Promise.all([
      _mockLLMAPI ? await _mockLLMAPI.stop() : undefined,
    ]);
  });

  describe('Non-streaming', () => {
    test('it should return a response', async () => {
      const content = 'FOO BAR!';
      const n = 10;
      const { endpoint, mockLLMAPI } = configureNonStreamingServer(content);
      _mockLLMAPI = mockLLMAPI;

      const contortionist = new Contortionist({
        model: {
          protocol: 'llamafile',
          endpoint,
        },
      });
      const result = await contortionist.execute('prompt', {
        n,
      });
      expect(result).toEqual(content);
    });

    test('it should be able to abort, per request', async () => {
      _mockLLMAPI = new MockLLMAPI();
      const endpoint = `http://localhost:${_mockLLMAPI.port}/completion`;

      const content = 'FOO BAR!';
      _mockLLMAPI.app.post('/completion', async (req, res) => {
        resolveServerCalled();
        await serverPromise;
        res.json(makeNonStreamingLlamafileResponse({
          content,
        }));
      });

      const contortionist = new Contortionist({
        model: {
          protocol: 'llamafile',
          endpoint,
        },
      });

      const [resolveServer, serverPromise] = makePromise();
      const [resolveServerCalled, serverCalledPromise] = makePromise();
      const abortController = new AbortController();
      const resultFn = vi.fn();
      const [resolveCatchPromise, catchPromise] = makePromise();
      const catchFn = vi.fn().mockImplementation(() => {
        resolveCatchPromise();
      });
      contortionist.execute('prompt', {
        n: 10,
        signal: abortController.signal,
      }).then(resultFn).catch(catchFn);
      await serverCalledPromise;
      abortController.abort();
      await catchPromise;
      expect(catchFn).toHaveBeenCalledWithError('This operation was aborted', 'AbortError');
      expect(resultFn).not.toHaveBeenCalled();

      // test that the server resolving does not result in a response
      resolveServer();
      expect(resultFn).not.toHaveBeenCalled();
    });
  });

  describe('Streaming', () => {
    // // it should stream automatically if given a callback
    test('it should stream and call callback', async () => {
      const n = 3;
      const content = 'abc';
      const { endpoint, mockLLMAPI } = configureStreamingServer(content, n);
      _mockLLMAPI = mockLLMAPI;
      const contortionist = new Contortionist({
        model: {
          protocol: 'llamafile',
          endpoint,
        },
      });
      const callback = vi.fn();
      const result = await contortionist.execute('prompt', {
        n,
        callback,
      });
      expect(result).toEqual(content);
      expect(callback).toHaveBeenCalledTimes(n);
      expect(callback).toHaveBeenNthCalledWith(1, { partial: 'a', chunk: makeStreamingLlamafileResponse({ content: 'a' }) });
      expect(callback).toHaveBeenNthCalledWith(2, { partial: 'ab', chunk: makeStreamingLlamafileResponse({ content: 'b' }) });
      expect(callback).toHaveBeenNthCalledWith(3, { partial: 'abc', chunk: makeStreamingLlamafileResponse({ content: 'c' }) });
    });

    test('it should be able to abort in the middle of a streaming request', async () => {
      const n = 3;
      _mockLLMAPI = new MockLLMAPI();
      const content = 'abc';
      const contortionist = new Contortionist({
        model: {
          protocol: 'llamafile',
          endpoint: `http://localhost:${_mockLLMAPI.port}/completion`,
        },
      });
      const [resolveServer, serverPromise] = makePromise();
      const [resolveServerCalled, serverCalledPromise] = makePromise();
      _mockLLMAPI.app.post('/completion', async (req, res) => {
        for (let i = 0; i < n; i++) {
          if (i > 1) {
            resolveServerCalled();
            await serverPromise;
          }
          res.write(`data: ${JSON.stringify(makeNonStreamingLlamafileResponse({
            content: `${content[i]}`,
          }))}\n`);

          // TODO: Is there a way to avoid this?
          await new Promise((r) => setTimeout(r, 10));
        }
        res.end();
      });
      const abortController = new AbortController();
      const resultFn = vi.fn();
      const [resolveCatchPromise, catchPromise] = makePromise();
      const catchFn = vi.fn().mockImplementation(() => {
        resolveCatchPromise();
      });
      const callback = vi.fn();
      contortionist.execute('prompt', {
        n,
        signal: abortController.signal,
        callback,
      }).then(resultFn).catch(catchFn);
      await serverCalledPromise;
      abortController.abort();
      await catchPromise;
      expect(catchFn).toHaveBeenCalledWithError('This operation was aborted', 'AbortError');
      expect(resultFn).not.toHaveBeenCalled();

      // test that the server resolving does not result in a response
      resolveServer();
      expect(resultFn).not.toHaveBeenCalled();

      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, { partial: 'a', chunk: makeNonStreamingLlamafileResponse({ content: 'a' }) });
      expect(callback).toHaveBeenNthCalledWith(2, { partial: 'ab', chunk: makeNonStreamingLlamafileResponse({ content: 'b' }) });
    });
  });
});
