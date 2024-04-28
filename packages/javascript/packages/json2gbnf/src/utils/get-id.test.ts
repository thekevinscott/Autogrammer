import { getID } from './get-id.js';

describe('getID', () => {
  test('it gets a character for a number', () => {
    expect(getID(0)).toEqual('a');
  });
});
