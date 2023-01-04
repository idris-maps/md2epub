import { readSourceFiles } from "./read-source-files.ts";
import {
  createFolderTree,
  folderIsFile,
  FolderTree,
} from "./create-folder-tree.ts";
import { FileTree } from "./toc-xhtml-file.ts";
import { convertPage } from "./convert-page.ts";
import { sectionXhtmlFile } from "./section-xhtml-file.ts";
import { init, last, shortenSentence, tail } from "./utils.ts";
import { createFolderRecursive } from "./create-folder-recursive.ts";

const sequential = async <A, B>(
  func: (d: A, i: number, prev?: B) => Promise<B>,
  arr: A[],
  i = 0,
  res: B[] = [],
  prev?: B,
): Promise<B[]> => {
  if (!arr.length) return res;
  const [d, ...rest] = arr;
  const _prev = await func(d, i, prev);
  res.push(_prev);
  return sequential(func, rest, i + 1, res, _prev);
};

const getLabel = (firstLine: string, fileName: string) => {
  const fromFirstLine = firstLine.split("#").join("").trim();
  if (fromFirstLine !== "") {
    return shortenSentence(fromFirstLine, 50);
  }
  return last(fileName.split(".md")[0].split("/"));
};

const fixXhtml = (d: string) => tail(d.split("/")).join("/");

const createXhtml = async (
  part: FolderTree,
  count: number,
): Promise<FileTree> => {
  if (folderIsFile(part)) {
    const { firstLine } = await convertPage(part.fileName, part.xhtml);
    const label = getLabel(firstLine, part.fileName);
    return { label, xhtml: fixXhtml(part.xhtml), playOrder: count + 1 };
  }
  await createFolderRecursive(init(part.xhtml.split("/")));
  await Deno.writeTextFile(part.xhtml, sectionXhtmlFile(part.label));
  return {
    label: part.label,
    xhtml: fixXhtml(part.xhtml),
    playOrder: count + 1,
    children: await sequential(
      (d, i) => createXhtml(d, i + 1 + count),
      part.children,
    ),
  };
};

const createAllXhtml = (parts: FolderTree[]) =>
  sequential(
    (d: FolderTree, _i: number, prev?: FileTree): Promise<FileTree> => {
      const prevCount = prev
        ? prev.children
          ? Math.max(...prev.children.map((d) => d.playOrder))
          : prev.playOrder
        : 1;
      return createXhtml(d, prevCount);
    },
    parts,
  );

export const createPagesAndGetToc = async (
  sourceFolder: string,
  destinationFolder: string,
) =>
  createAllXhtml(
    createFolderTree(
      await readSourceFiles(sourceFolder),
      sourceFolder,
      destinationFolder,
    ),
  );
