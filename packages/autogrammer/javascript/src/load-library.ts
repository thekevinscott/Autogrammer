import type * as transformers from '@xenova/transformers';

export function loadLibrary<T>(url: string) {
  return import(url).then((module: T) => module);
}

export const loadTransformersJS = async (): Promise<typeof transformers> => {
  const transformersJS = await loadLibrary<typeof transformers>(
    'https://cdn.jsdelivr.net/npm/@xenova/transformers/dist/transformers.min.js'
  );

  transformersJS.env.allowRemoteModels = true;
  transformersJS.env.allowLocalModels = false;

  return transformersJS;
};
