interface CustomMatchers<R = unknown, A = unknown> {
  toHaveBeenCalledWithError(message: string, type: string): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> { }
  interface AsymmetricMatchersContaining extends CustomMatchers { }
}
