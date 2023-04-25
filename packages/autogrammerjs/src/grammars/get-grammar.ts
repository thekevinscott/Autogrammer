import { SupportedLanguage, } from "../types.js";
import Mustache from 'mustache';
// import type { Grammar } from 'contort';
import SQL_GRAMMAR from './sql.gbnf?raw' assert { type: 'text' };
import JSON_GRAMMAR from './json.gbnf?raw' assert { type: 'text' };
// import PYTHON_GRAMMAR from './python.gbnf?raw';
// import JAVASCRIPT_GRAMMAR from './javascript.gbnf?raw';

export type Variables<L extends SupportedLanguage> = L extends 'sql' ? (Variables_SQL | string) : object;

type Variables_SQL = {
  selectlist?: string[];
  tablename?: string[];
};

export function isLanguage<L extends SupportedLanguage>(language: SupportedLanguage, testingLanguage: L): language is L {
  return language === testingLanguage;
}

function parseSQLVariables(variables: Variables_SQL | string): Variables_SQL {
  if (typeof variables === 'string') {
    return {};
  }
  return variables;
};

function buildGrammar<L extends SupportedLanguage>(language: L, grammarTemplate: string, variables: Variables<L> = {}) {
  if (isLanguage(language, 'sql')) {
    const sqlVariables = Object.entries(parseSQLVariables(variables));
    return Mustache.render(grammarTemplate, sqlVariables.reduce((obj, [key, value,]) => {
      if (value.length === 0) {
        return obj;
      }
      return {
        ...obj,
        [key]: value.map(v => JSON.stringify(v)).join(" | "),
      };
    }, {
      selectlist: 'string',
      tablename: 'string',
    }));
  }
  return grammarTemplate;
};

const GRAMMARS: Record<SupportedLanguage, string> = {
  sql: SQL_GRAMMAR as string,
  // javascript: JAVASCRIPT_GRAMMAR,
  // python: PYTHON_GRAMMAR,
  json: JSON_GRAMMAR as string,
};

export function getGrammar<L extends SupportedLanguage>(
  language: L,
  variables?: Variables<L>,
): string {
  return buildGrammar<L>(language, GRAMMARS[language], variables);
}
