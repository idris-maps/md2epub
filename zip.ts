import { JSZip } from "./deps.ts";

const readFolder = async (path: string) => {
  const dirs = [];
  const files = [];
  try {
    const content = Deno.readDir(path);
    for await (const d of content) {
      if (d.isDirectory) dirs.push(d.name);
      if (d.isFile) files.push(d.name);
    }
    return { dirs, files };
  } catch {
    return { dirs, files };
  }
};

const addFile = async (
  zip: JSZip,
  name: string,
  path: string[] = [],
  log: (d: string) => void,
) => {
  const file = await Deno.readFile([...path, name].join("/"));
  log(" - adding " + name);
  zip.addFile(name, file);
};

const zipFolder = async (
  folder: string,
  log: (d: string) => void,
  path: string[] = [],
  zip?: JSZip,
) => {
  const f = zip ? zip.folder(folder) : new JSZip();
  const { dirs, files } = await readFolder([...path, folder].join("/"));
  await Promise.all(files.map((d) => addFile(f, d, [...path, folder], log)));
  await Promise.all(dirs.map((d) => zipFolder(d, log, [...path, folder], f)));
  return f;
};

export const createEpub = async (
  folder: string,
  name: string,
  log: (d: string) => void,
) => {
  const zip = await zipFolder(folder, log);
  log(" - compressing file");
  return zip.writeZip(name + ".epub");
};
