import './matchers/index.js';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const TMP_DIR = path.resolve(__dirname, '../../tmp/integration-tests');
// setLogLevel('error');
