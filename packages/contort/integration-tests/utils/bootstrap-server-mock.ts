import MockLLMAPI from "./mock-llm-api.js";

type MakeResponse<R> = (opts: { content: string; }) => R;
export function configureNonStreamingServer<R>(content: string, makeResponse: MakeResponse<R>) {
  const mockLLMAPI = new MockLLMAPI();
  const endpoint = `http://localhost:${mockLLMAPI.port}/completion`;

  mockLLMAPI.app.post('/completion', (req, res) => {
    res.send(`${JSON.stringify(makeResponse({
      content,
    }))}`);
  });
  return { endpoint, mockLLMAPI, };
};

export function configureStreamingServer<R>(content: string, n: number, makeResponse: MakeResponse<R>) {
  const mockLLMAPI = new MockLLMAPI();
  const endpoint = `http://localhost:${mockLLMAPI.port}/completion`;

  mockLLMAPI.app.post('/completion', async (req, res) => {
    for (let i = 0; i < n; i++) {
      res.write(`data: ${JSON.stringify(makeResponse({
        content: `${content[i]}`,
      }))}\n`);

      // TODO: Is there a way to avoid this?
      await new Promise((r) => setTimeout(r, 10));
    }
    res.end();
  });
  return { endpoint, mockLLMAPI, };
};
