/**
 * This tests the various functionality that Contortionist exposes.
 */

import Contortionist from "contort";
import { vi, } from "vitest";
import { setLogLevel, } from 'testeroni';
import {
  makeLlamaCPPResponse,
} from "../__mocks__/mock-llama-cpp-response.js";
import { makePromise } from "../utils/make-promise.js";
import {
  configureNonStreamingServer as _configureNonStreamingServer,
  configureStreamingServer as _configureStreamingServer,
} from "../utils/bootstrap-server-mock.js";
import MockLLMAPI from "../utils/mock-llm-api.js";
import { buildContortionist } from "../utils/build-contortionist.js";

setLogLevel('warn')
const configureNonStreamingServer = (content: string) => _configureNonStreamingServer(content, makeLlamaCPPResponse);
const configureStreamingServer = (content: string, n: number) => _configureStreamingServer(content, n, makeLlamaCPPResponse);

describe('llama.cpp', async () => {
  let _mockLLMAPI: MockLLMAPI;

  beforeAll(() => buildContortionist());

  afterEach(async () => {
    await Promise.all([
      _mockLLMAPI ? await _mockLLMAPI.stop() : undefined,
    ]);
  });

  describe('Calling locally', () => {
    describe('Non-streaming', () => {
      test('it should return a response', async () => {
        const content = 'FOO BAR!';
        const n = 10;
        const { endpoint, mockLLMAPI } = configureNonStreamingServer(content);
        _mockLLMAPI = mockLLMAPI;

        const contortionist = new Contortionist({
          model: {
            protocol: 'llama.cpp',
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
          res.json(makeLlamaCPPResponse({
            content,
          }));
        });

        const contortionist = new Contortionist({
          model: {
            protocol: 'llama.cpp',
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

      test('it should be able to abort a request without affecting other requests', async () => {
        _mockLLMAPI = new MockLLMAPI();
        const contortionist = new Contortionist({
          model: {
            protocol: 'llama.cpp',
            endpoint: `http://localhost:${_mockLLMAPI.port}/completion`,
          },
        });
        const [resolveServer, serverPromise] = makePromise();
        const [resolveServerCalled, serverCalledPromise] = makePromise();
        _mockLLMAPI.app.post('/completion', async (req, res) => {
          resolveServerCalled();
          await serverPromise;
          res.json(makeLlamaCPPResponse({
            content: req.body.prompt,
          }));
        });
        const abortController = new AbortController();
        const resultFn = vi.fn();
        const [resolveCatchPromise, catchPromise] = makePromise();
        const catchFn = vi.fn().mockImplementation(() => {
          resolveCatchPromise();
        });
        const requests = [
          contortionist.execute('prompt1', {
            n: 10,
          }),
          contortionist.execute('prompt2', {
            n: 10,
          }),
        ];
        contortionist.execute('aborted prompt', {
          n: 10,
          signal: abortController.signal,
        }).then(resultFn).catch(catchFn);
        await serverCalledPromise;
        abortController.abort();
        await catchPromise;
        expect(catchFn).toHaveBeenCalledWithError('This operation was aborted', 'AbortError');
        expect(resultFn).not.toHaveBeenCalled();
        resolveServer();

        expect(await requests[0]).toEqual('prompt1');
        expect(await requests[1]).toEqual('prompt2');
      });

      test('it should be able to abort all requests', async () => {
        _mockLLMAPI = new MockLLMAPI();
        const contortionist = new Contortionist({
          model: {
            protocol: 'llama.cpp',
            endpoint: `http://localhost:${_mockLLMAPI.port}/completion`,
          },
        });
        const [resolveServer, serverPromise] = makePromise();
        const [resolveServerCalled, serverCalledPromise] = makePromise();
        let serverCount = 0;
        _mockLLMAPI.app.post('/completion', async (req, res) => {
          serverCount += 1;
          if (serverCount === 3) {
            resolveServerCalled();
          }
          await serverPromise;
          res.json(makeLlamaCPPResponse({
            content: req.body.prompt,
          }));
        });
        const [resolveCatchPromise, catchPromise] = makePromise();
        let resultFns = [];
        let catchFns = [];
        let requests = [];
        let catchCount = 0;
        for (let i = 0; i < 3; i++) {
          resultFns.push(vi.fn());
          catchFns.push(vi.fn().mockImplementation(() => {
            catchCount += 1;
            if (catchCount === 3) {
              resolveCatchPromise();
            }
          }));
          requests.push(contortionist.execute(`prompt${i}`, {
            n: 10,
          }).then(resultFns[i]).catch(catchFns[i]));
        }
        await serverCalledPromise;
        contortionist.abort();
        await catchPromise;
        expect(catchFns[0]).toHaveBeenCalledWithError('This operation was aborted', 'AbortError');
        expect(catchFns[1]).toHaveBeenCalledWithError('This operation was aborted', 'AbortError');
        expect(catchFns[2]).toHaveBeenCalledWithError('This operation was aborted', 'AbortError');
        resolveServer();
        expect(resultFns[0]).not.toHaveBeenCalled();
        expect(resultFns[1]).not.toHaveBeenCalled();
        expect(resultFns[2]).not.toHaveBeenCalled();
      });

    });

    describe('Streaming', () => {
      // // it should stream automatically if given a callback
      test('it should stream', async () => {
        const n = 3;
        const content = 'abc';
        const { endpoint, mockLLMAPI } = configureStreamingServer(content, n);
        _mockLLMAPI = mockLLMAPI;
        const contortionist = new Contortionist({
          model: {
            protocol: 'llama.cpp',
            endpoint,
          },
        });
        const result = await contortionist.execute('prompt', {
          n,
          stream: true,
        });
        expect(result).toEqual(content);
      });

      test('it should automatically stream with callback', async () => {
        const n = 3;
        const content = 'abc';
        const { endpoint, mockLLMAPI } = configureStreamingServer(content, n);
        _mockLLMAPI = mockLLMAPI;
        const contortionist = new Contortionist({
          model: {
            protocol: 'llama.cpp',
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
        expect(callback).toHaveBeenNthCalledWith(1, { partial: 'a', chunk: makeLlamaCPPResponse({ content: 'a' }) });
        expect(callback).toHaveBeenNthCalledWith(2, { partial: 'ab', chunk: makeLlamaCPPResponse({ content: 'b' }) });
        expect(callback).toHaveBeenNthCalledWith(3, { partial: 'abc', chunk: makeLlamaCPPResponse({ content: 'c' }) });
      });

      test('it should be able to abort in the middle of a streaming request', async () => {
        const n = 3;
        _mockLLMAPI = new MockLLMAPI();
        const content = 'abc';
        const contortionist = new Contortionist({
          model: {
            protocol: 'llama.cpp',
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
            res.write(`data: ${JSON.stringify(makeLlamaCPPResponse({
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
        expect(callback).toHaveBeenNthCalledWith(1, { partial: 'a', chunk: makeLlamaCPPResponse({ content: 'a' }) });
        expect(callback).toHaveBeenNthCalledWith(2, { partial: 'ab', chunk: makeLlamaCPPResponse({ content: 'b' }) });
      });
    });
  });
});

