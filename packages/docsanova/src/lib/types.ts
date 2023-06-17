import type {
  getCreateFile,
} from "./utils/get-create-file.js";

export interface Opts {
  input: string;
  contentDir: string;
  srcDir: string;
  internalDir: string;
  output: string;
}

export type CreateFile = ReturnType<typeof getCreateFile>;

export interface FileDefinition {
  input: string;
  output: string;
  transform?: (content: string) => string;
}
