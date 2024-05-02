import { SUPPORTED_LANGUAGES, } from "./constants.js";
import {
  SupportedLanguage,
} from "./types.js";

export const isSupportedLanguage = (language: string): language is SupportedLanguage => SUPPORTED_LANGUAGES.includes(language);
