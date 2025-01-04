import { ParseFlags, toHtml } from "./deps.ts";
import { createFolderRecursive } from "./create-folder-recursive.ts";
import { init, last } from "./utils.ts";

const start = (title: string) =>
  `
<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="sv-SE" xml:lang="sv-SE">
  <head>
    <title>${title}</title>
  </head>
  <body>
`.trim();

const end = `
  </body>
</html>
`;

const separateFrontmatter = (md: string) => {
  if (md.startsWith("---")) {
    return md.split("---").filter((_, i) => i > 1).join("---");
  }
  return md;
};

const createFolderIfNoExist = (xhtml: string) =>
  createFolderRecursive(init(xhtml.split("/")));

const removeChars = (chars: string[], d: string) =>
  Array.from(d).filter((c) => !chars.includes(c)).join("").split(" ").filter(
    (c) => c !== "",
  ).join(" ").trim();

const findTitle = (lines: string[]): string => {
  if (!lines.length) return "";
  const [first, ...rest] = lines;
  const d = removeChars(["#", "*"], first);
  if (d !== "") return d;
  return findTitle(rest);
};

export const convertPage = async (fileName: string, xhtml: string) => {
  const md = separateFrontmatter((await Deno.readTextFile(fileName)).trim());
  let title = findTitle(md.split("\n"));
  if (title.trim() === "") {
    title = last(fileName.split(".md")[0].split("/"));
  }

  const originalHtml = await toHtml(md, {
    format: "xhtml",
    parseFlags: ParseFlags.DEFAULT,
  });
  const html = originalHtml
    // remove empty link tags
    .replace(/<a\b[^>]*><\/a>/g, "")
    // remove aria-hidden
    .replaceAll(' aria-hidden="true"', "");

  const file = [start(title), html, end]
    .join("\n");
  await createFolderIfNoExist(xhtml);
  await Deno.writeTextFile(xhtml, file);

  return { fileName, title };
};
