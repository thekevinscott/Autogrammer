export const isExcluded = (path: string) => {
  return path.startsWith('.')
    || path.startsWith('node_modules')
    || path.endsWith('.DS_Store')
    || path.includes('backup')
    || path.endsWith('.wireit')
    || path.endsWith('dev')
    || path.endsWith('.eslintrc.cjs')
    || path.endsWith('README.md')
    || path.includes('dev/browser')
    || path.length > 200;
};
