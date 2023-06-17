import path from 'path';
import {
  CONTENT,
  DOCSANOVA_ROOT,
  INTERNAL_JS_FOLDER,
} from './constants.js';
import type {
  FileDefinition,
} from './types.js';

export const getConfigurationFiles = (inputDir: string, internalDir: string): FileDefinition[] => ([
  {
    input: path.join(inputDir, 'docsanova.json'),
    output: path.join(internalDir, '_data/docsanova.json'),
  },
  {
    input: path.join(DOCSANOVA_ROOT, 'eleventy.config.cjs.mustache'),
    output: path.join(internalDir, 'eleventy.config.cjs'),
  },
]);

export const getContentDirectories = ({
  inputDir,
  contentDir,
  srcDir,
  internalDir,
}: {
  inputDir: string;
  contentDir: string;
  srcDir: string;
  internalDir: string;
}): FileDefinition[] => ([
  {
    input: path.resolve(inputDir, contentDir),
    output: path.resolve(internalDir),
  },
  {
    input: path.resolve(inputDir, srcDir, 'pages'),
    output: path.resolve(internalDir),
    transform: (content: string) => `
    {% extends "layouts/base.html" %} 
    {% block content %}
    ${content}
    {% endblock %}
    `,
  },
  {
    input: path.resolve(DOCSANOVA_ROOT, CONTENT),
    output: path.resolve(internalDir),
  },
  {
    input: path.resolve(DOCSANOVA_ROOT, INTERNAL_JS_FOLDER),
    output: path.resolve(internalDir, '_internal_js'),
  },
  {
    input: path.resolve(inputDir, srcDir, 'styles'),
    output: path.resolve(internalDir, 'styles'),
  },
]);
