import { expect } from 'vitest';
import MockLLMAPI from '../../utils/mock-llm-api';

expect.extend({
  toHaveBeenCalledWithParameters(mockLLMAPI, parameters, allowPartial = true) {
    if (!(mockLLMAPI instanceof MockLLMAPI)) {
      return {
        message: () => `This matcher only works with MockLLMAPI instances`,
        pass: false,
      };
    }

    const { isNot } = this;
    if (isNot) {
      return {
        message: () => `"not" is not yet implemented`,
        pass: false,
      };
    }
    const { completion } = mockLLMAPI;

    let isMatch = false;
    const errors = [];
    for (const [req, _res, _next] of completion.mock.calls) {
      try {
        if (allowPartial) {
          expect(req.body).toEqual(expect.objectContaining(parameters));
        } else {
          expect(req.body).toEqual(parameters);
        }
        isMatch = true;
      } catch (err) {
        errors.push(err);
      }
    }

    if (isMatch) {
      return {
        message: () => `${allowPartial ? 'Partial match,' : 'Exact match,'} everything looks good`,
        pass: true
      };
    }

    return {
      message: () => errors.map(err => err.message).join('\n'),
      pass: false,
    };
  }
});
