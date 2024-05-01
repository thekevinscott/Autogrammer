export const getPromise = (): [Promise<void>, () => void] => {
  let readyCallback: undefined | (() => void) = undefined;
  const ready = new Promise<void>(resolve => {
    readyCallback = resolve;
  });
  if (!readyCallback) {
    throw new Error('No readyCallback');
  }
  return [ready, readyCallback,];
};


