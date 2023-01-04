import { toHtml } from "./deps.ts";
import { createFolderRecursive } from "./create-folder-recursive.ts";

const start = `
<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="sv-SE" xml:lang="sv-SE">
  <body>
`.trim();

const end = `
  </body>
</html>
`;

const init = <T>(arr: T[]): T[] => {
  const result: T[] = [];
  arr.forEach((d, i) => {
    if (i + 1 < arr.length) {
      result.push(d);
    }
  });
  return result;
};

const createFolderIfNoExist = (xhtml: string) =>
  createFolderRecursive(init(xhtml.split("/")));

export const convertPage = async (fileName: string, xhtml: string) => {
  const md = (await Deno.readTextFile(fileName)).trim();
  const firstLine = md.split("\n")[0];
  const html = await toHtml(md);
  const file = [start, html, end].join("\n");
  await createFolderIfNoExist(xhtml);
  await Deno.writeTextFile(xhtml, file);
  return { fileName, firstLine };
};
