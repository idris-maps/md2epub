import type { FileTree } from "./toc-xhtml-file.ts";

interface File {
  source: string;
  destination: string;
}

interface Folder {
  name: string;
  path: string;
  files: File[];
  children: Folder[];
}

const lastPart = (d: string) => d.split("/").slice(-1)[0];

const getDestination = (source: string, destinationFolder: string) => {
  const normalized = (source.split("/").slice(1).map((d) => d.split(" ")))
    .flat().filter((d) => d !== "").join("-").toLowerCase();
  return destinationFolder + "/" + normalized.slice(0, -2) + "xhtml";
};

const readDir = async (dir: string, destinationFolder: string) => {
  const folders: string[] = [];
  const files: File[] = [];
  for await (const d of Deno.readDir(dir)) {
    if (d.isDirectory) {
      folders.push(dir + "/" + d.name);
    }
    if (d.isFile && d.name.endsWith(".md")) {
      const source = dir + "/" + d.name;
      const destination = getDestination(source, destinationFolder);
      files.push({ source, destination });
    }
  }
  folders.sort();
  files.sort((a, b) => (a.source || 0) > (b.source || 0) ? 1 : -1);
  return { folders, files };
};

const readDirRecursive = async (
  dir: string,
  destinationFolder: string,
): Promise<Folder> => {
  const { folders, files } = await readDir(dir, destinationFolder);
  return {
    name: lastPart(dir),
    path: dir,
    files,
    children: await Promise.all(
      folders.map((d) => readDirRecursive(d, destinationFolder)),
    ),
  };
};

const toFileTree = (
  destinationFolder: string,
  folder: Folder,
  playOrder = 0,
): [FileTree, number] => {
  playOrder = playOrder + 1;
  const currentTree: FileTree & { children: FileTree[] } = {
    label: folder.name,
    xhtml: getDestination(folder.path + "/00000-title.md", destinationFolder),
    playOrder,
    children: [],
  };
  for (const file of folder.files) {
    playOrder = playOrder + 1;
    currentTree.children.push({
      label: file.source.split("/").slice(-1)[0].split(".md")[0],
      xhtml: file.destination,
      playOrder,
    });
  }

  for (const dir of folder.children) {
    const [tree, order] = toFileTree(destinationFolder, dir, playOrder);
    playOrder = order;
    currentTree.children.push(tree);
  }

  return [currentTree, playOrder];
};

const getFilesToConvert = (
  folder: Folder,
): { id: string; source: string; destination: string }[] => {
  const fromChildren = folder.children.map(getFilesToConvert);
  return [...folder.files, ...(fromChildren.flat())].map((d) => ({
    ...d,
    id: crypto.randomUUID(),
  }));
};

const getFilesToCreate = (
  tree: FileTree,
): { id: string; label: string; destination: string }[] => {
  const toCreate: { id: string; label: string; destination: string }[] = [];
  if (tree.children) {
    toCreate.push({
      id: crypto.randomUUID(),
      label: tree.label,
      destination: tree.xhtml,
    });
    for (const child of tree.children) {
      for (const d of getFilesToCreate(child)) {
        toCreate.push(d);
      }
    }
  }
  return toCreate;
};

export const getSourceFiles = async (
  sourceFolder: string,
  destinationFolder: string,
) => {
  const folder = await readDirRecursive(sourceFolder, destinationFolder);
  const [fileTree] = toFileTree(destinationFolder, folder);
  const filesToConvert = getFilesToConvert(folder);
  const filesToCreate = getFilesToCreate(fileTree);
  return { fileTree, filesToConvert, filesToCreate };
};

export const addLabelToTree = (
  fileTree: FileTree,
  destination: string,
  label: string,
) => {
  if (fileTree.xhtml === destination) {
    fileTree.label = label;
  }
  for (const child of fileTree.children || []) {
    addLabelToTree(child, destination, label);
  }
};
