import Contortionist, { LlamaCPPResponse } from "contort";
import MockLLMAPI from "mock-llm-api";
import { vi, } from "vitest";

const makeLlamaCPPResponse = (response: Partial<LlamaCPPResponse> = {}): LlamaCPPResponse => ({
  content: 'foobar',
  id_slot: 42,
  model: "llama-1",
  prompt: "This is an example prompt.",
  stop: false,
  stopped_eos: false,
  stopped_limit: true,
  stopped_word: false,
  stopping_word: "stopword",
  tokens_cached: 100,
  tokens_evaluated: 400,
  tokens_predicted: 300,
  truncated: false,
  ...response,
  generation_settings: {
    dynatemp_exponent: 1.5,
    dynatemp_range: 10,
    frequency_penalty: 0.5,
    grammar: "default",
    ignore_eos: false,
    logit_bias: [0, 1, 2],
    min_keep: 5,
    min_p: 0.1,
    mirostat: 0.2,
    mirostat_eta: 0.01,
    mirostat_tau: 0.1,
    model: "llama-1",
    n_ctx: 1024,
    n_keep: 10,
    n_predict: 500,
    n_probs: 5,
    penalize_nl: true,
    penalty_prompt_tokens: ["example", "test"],
    presence_penalty: 0.4,
    repeat_last_n: 2,
    repeat_penalty: 1.2,
    samplers: ["top_k", "top_p"],
    seed: [123456, 789012],
    stop: ["\n"],
    stream: true,
    temperature: 0.7,
    tfs_z: 0.5,
    top_k: 50,
    top_p: 0.9,
    typical_p: 0.95,
    use_penalty_prompt_tokens: true,
    ...response.generation_settings,
  },
  timings: {
    predicted_ms: 1500,
    predicted_n: 300,
    predicted_per_second: 200,
    predicted_per_token_ms: 5,
    prompt_ms: 200,
    prompt_n: 50,
    prompt_per_second: 250,
    prompt_per_token_ms: 4,
    ...response.timings,
  },
});

const makePromise = () => {
  let resolvePromise;
  const promise = new Promise((r) => {
    resolvePromise = r;
  });
  return [
    resolvePromise,
    promise,
  ];
};

describe('llama.cpp', () => {
  let mockLLMAPI: MockLLMAPI;

  afterEach(async () => {
    await mockLLMAPI.stop();
  });

  describe('Non-streaming', () => {
    test('it should return a response', async () => {
      mockLLMAPI = new MockLLMAPI();
      const content = 'FOO BAR!';
      const contortionist = new Contortionist({
        model: {
          protocol: 'llama.cpp',
          endpoint: `http://localhost:${mockLLMAPI.port}/completion`,
        },
      });
      mockLLMAPI.app.post('/completion', (req, res) => {
        res.send(`${JSON.stringify(makeLlamaCPPResponse({
          content,
        }))}`);
      });
      const result = await contortionist.execute('prompt', {
        n_predict: 10,
      });
      expect(result).toEqual(content);
    });

    test('it should be able to abort, per request', async () => {
      mockLLMAPI = new MockLLMAPI();
      const content = 'FOO BAR!';
      const contortionist = new Contortionist({
        model: {
          protocol: 'llama.cpp',
          endpoint: `http://localhost:${mockLLMAPI.port}/completion`,
        },
      });
      const [resolveServer, serverPromise] = makePromise();
      const [resolveServerCalled, serverCalledPromise] = makePromise();
      mockLLMAPI.app.post('/completion', async (req, res) => {
        resolveServerCalled();
        await serverPromise;
        res.json(makeLlamaCPPResponse({
          content,
        }));
      });
      const abortController = new AbortController();
      const resultFn = vi.fn();
      const [resolveCatchPromise, catchPromise] = makePromise();
      const catchFn = vi.fn().mockImplementation((err) => {
        resolveCatchPromise();
      });
      contortionist.execute('prompt', {
        n_predict: 10,
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
      mockLLMAPI = new MockLLMAPI();
      const contortionist = new Contortionist({
        model: {
          protocol: 'llama.cpp',
          endpoint: `http://localhost:${mockLLMAPI.port}/completion`,
        },
      });
      const [resolveServer, serverPromise] = makePromise();
      const [resolveServerCalled, serverCalledPromise] = makePromise();
      mockLLMAPI.app.post('/completion', async (req, res) => {
        resolveServerCalled();
        await serverPromise;
        res.json(makeLlamaCPPResponse({
          content: req.body.prompt,
        }));
      });
      const abortController = new AbortController();
      const resultFn = vi.fn();
      const [resolveCatchPromise, catchPromise] = makePromise();
      const catchFn = vi.fn().mockImplementation((err) => {
        resolveCatchPromise();
      });
      const requests = [
        contortionist.execute('prompt1', {
          n_predict: 10,
        }),
        contortionist.execute('prompt2', {
          n_predict: 10,
        }),
      ];
      contortionist.execute('aborted prompt', {
        n_predict: 10,
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
      mockLLMAPI = new MockLLMAPI();
      const contortionist = new Contortionist({
        model: {
          protocol: 'llama.cpp',
          endpoint: `http://localhost:${mockLLMAPI.port}/completion`,
        },
      });
      const [resolveServer, serverPromise] = makePromise();
      const [resolveServerCalled, serverCalledPromise] = makePromise();
      let serverCount = 0;
      mockLLMAPI.app.post('/completion', async (req, res) => {
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
        catchFns.push(vi.fn().mockImplementation((err) => {
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
      mockLLMAPI = new MockLLMAPI();
      const contortionist = new Contortionist({
        model: {
          protocol: 'llama.cpp',
          endpoint: `http://localhost:${mockLLMAPI.port}/completion`,
        },
      });
      mockLLMAPI.app.post('/completion', async (req, res) => {
        for (let i = 0; i < n; i++) {
          res.write(`data: ${JSON.stringify(makeLlamaCPPResponse({
            content: `${content[i]}`,
          }))}\n`);

          // TODO: Is there a way to avoid this?
          await new Promise((r) => setTimeout(r, 10));
        }
        res.end();
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
      mockLLMAPI = new MockLLMAPI();
      const contortionist = new Contortionist({
        model: {
          protocol: 'llama.cpp',
          endpoint: `http://localhost:${mockLLMAPI.port}/completion`,
        },
      });
      mockLLMAPI.app.post('/completion', async (req, res) => {
        for (let i = 0; i < n; i++) {
          res.write(`data: ${JSON.stringify(makeLlamaCPPResponse({
            content: `${content[i]}`,
          }))}\n`);

          // TODO: Is there a way to avoid this?
          await new Promise((r) => setTimeout(r, 10));
        }
        res.end();
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
      mockLLMAPI = new MockLLMAPI();
      const content = 'abc';
      const contortionist = new Contortionist({
        model: {
          protocol: 'llama.cpp',
          endpoint: `http://localhost:${mockLLMAPI.port}/completion`,
        },
      });
      const [resolveServer, serverPromise] = makePromise();
      const [resolveServerCalled, serverCalledPromise] = makePromise();
      mockLLMAPI.app.post('/completion', async (req, res) => {
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
      const catchFn = vi.fn().mockImplementation((err) => {
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
