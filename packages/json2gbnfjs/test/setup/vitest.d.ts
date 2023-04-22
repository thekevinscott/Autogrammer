interface CustomMatchers<R = unknown> {
  toHaveBeenCalledWithError(message: string, type: string): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> { }
  interface AsymmetricMatchersContaining extends CustomMatchers { }
}
