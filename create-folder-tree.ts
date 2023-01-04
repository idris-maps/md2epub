import { SourceFiles, sourceIsFile } from "./read-source-files.ts";
import { last, slugify } from "./utils.ts";

interface TreeFile {
  fileName: string;
  xhtml: string;
}
interface TreeFolder {
  label: string;
  xhtml: string;
  children: (TreeFile | TreeFolder)[];
}
export type FolderTree = TreeFolder | TreeFile;

const buildTree = (
  d: SourceFiles | { file: true },
  sourceFolder: string,
  destinationFolder: string,
  path: string[] = [],
): FolderTree => {
  if (sourceIsFile(d)) {
    return {
      fileName: [sourceFolder, ...path].join("/"),
      xhtml: slugify([destinationFolder, ...path].join("/")) + ".xhtml",
    };
  }
  const children = Object.keys(d)
    .map((key) =>
      buildTree(d[key], sourceFolder, destinationFolder, [...path, key])
    )
    .sort((a, b) => a.xhtml > b.xhtml ? 1 : -1);

  return {
    label: last(path),
    xhtml: slugify([destinationFolder, ...path].join("/")) + ".xhtml",
    children,
  };
};

export const createFolderTree = (
  d: SourceFiles,
  sourceFolder: string,
  destinationFolder: string,
): FolderTree[] => {
  const res = buildTree(d, sourceFolder, destinationFolder);
  // @ts-ignore ?
  return res.children;
};

export const folderIsFile = (d: FolderTree): d is TreeFile =>
  !Object.keys(d).includes("children");
