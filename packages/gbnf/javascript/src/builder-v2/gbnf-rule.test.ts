import {
  describe,
  test,
  expect,
} from 'vitest';
import {
  $,
  _
} from './template-tags.js';

describe('GBNFRule', () => {
  test('it logs', () => {
    const rule = $`foo`;
    expect(rule.log()).toEqual('foo')
  });

  test('it logs a _ string', () => {
    const rule = _`"foo"`;
    expect(rule.log()).toEqual('foo')
  });

  test('it logs two paths', () => {
    const rule = _`${$`foo`} | ${$`bar`}`;
    expect(rule.log()).toEqual('foo\nbar')
  });

  test('it logs overlapping paths', () => {
    const rule = _`${$`foo`} | ${$`f`}`;
    expect(rule.log()).toEqual('f\nfoo')
  });

  test('turns ranges into x', () => {
    const rule = _`[a-z]`;
    expect(rule.log()).toEqual('x')
  });

  test('turns multiple ranges into x', () => {
    const rule = _`[a-z][a-z][a-z]`;
    expect(rule.log()).toEqual('xxx')
  });

  test('it handles a range and a string', () => {
    const rule = _`[a-e] | "foo"`;
    expect(rule.log()).toEqual('x\nfoo')
  });

  test('it handles an optional', () => {
    const rule = _`"z" ([a-e]? | "foo")`;
    expect(rule.log()).toEqual('z\nzx\nzfoo')
  });

  test('it handles an optional on a rule', () => {
    const rule = _`"z" (("bar")? | "foo")`;
    expect(rule.log()).toEqual('z\nzbar\nzfoo')
  });

  test('it handles a star', () => {
    const rule = _`"z" ("y")*`;
    expect(rule.log()).toEqual(['z', 'zy', 'zyy', 'zyyy'].join('\n'))
  });

  test('it handles a star wrapping a rule', () => {
    const rule = _`"z" ([a-e] | "foo")*`;
    expect(rule.log()).toEqual([
      'z',
      'zx',
      'zxx',
      'zxxx',
      'zxxfoo',
      'zxfoo',
      'zxfoox',
      'zxfoofoo',
      'zfoo',
      'zfoox',
      'zfooxx',
      'zfooxfoo',
      'zfoofoo',
      'zfoofoox',
      'zfoofoofoo',
    ].join('\n'))
  });

  test('it handles a plus', () => {
    const rule = _`"z" ("y")+`;
    expect(rule.log()).toEqual([
      'zy',
      'zyy',
      'zyyy',
    ].join('\n'))
  });

  test('it handles a negative', () => {
    const rule = _`"z" [^a-zA-Z]`;
    expect(rule.log()).toEqual([
      'z^',
    ].join('\n'))
  });
});
