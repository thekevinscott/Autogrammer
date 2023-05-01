export const makePromise = () => {
  let resolvePromise;
  const promise = new Promise((r) => {
    resolvePromise = r;
  });
  return [
    resolvePromise,
    promise,
  ];
};
