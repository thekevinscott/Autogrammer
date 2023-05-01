import { bundle as _bundle, } from 'testeroni';
import { buildContortionist, } from './build-contortionist.js';

export async function bundle(bundlerName: string, outDir: string, args: Parameters<typeof _bundle>[2] = {}) {
  await buildContortionist();

  // bundle the app
  if (bundlerName !== 'umd') {
    args.silentPackageInstall = true;
  }
  await _bundle(bundlerName, outDir, args);
}
