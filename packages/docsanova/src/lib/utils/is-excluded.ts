export const isExcluded = (path: string) => {
  return path.startsWith('.') || path.startsWith('node_modules') || path.includes('.DS_Store') || path.includes('backup');
};
