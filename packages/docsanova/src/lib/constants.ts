import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const DOCSANOVA_ROOT = path.resolve(__dirname, "../../");
export const CONTENT = path.resolve(DOCSANOVA_ROOT, "content");
export const INTERNAL_JS_FOLDER = path.resolve(DOCSANOVA_ROOT, "js");
