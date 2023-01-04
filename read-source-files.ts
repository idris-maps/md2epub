import { readDirDeep } from "./deps.ts";

export interface SourceFiles {
  [key: string]: SourceFiles | { file: true };
}

const addToTree = (
  d: SourceFiles,
  parts: string[],
): SourceFiles => {
  const [first, ...rest] = parts;

  if (!rest.length) {
    return { ...d, [first]: { file: true } };
  }

  const subtree = d[first] || {};

  return {
    ...d,
    // @ts-ignore ?
    [first]: addToTree(subtree, rest),
  };
};

export const readSourceFiles = async (sourceFolder: string) => {
  const files = await readDirDeep(sourceFolder);

  return files
    .filter((d) => d.endsWith(".md"))
    .map((d) => d.split("/"))
    .reduce(addToTree, {});
};

export const sourceIsFile = (
  d: SourceFiles | { file: true },
): d is { file: true } => d.file && String(d.file) === "true";
