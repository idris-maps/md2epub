import { getMeta } from "./get-meta.ts";
import { createPagesAndGetToc } from "./create-pages-and-get-toc.ts";
import { contentOpfFile } from "./content-opf-file.ts";
import { FileTree, tocXhtmlFile } from "./toc-xhtml-file.ts";
import { tocNcxFile } from "./toc-ncx-file.ts";
import { otherFiles } from "./other-files.ts";
import { getRelativePath } from "./utils.ts";
import { sectionXhtmlFile } from "./section-xhtml-file.ts";
import { createEpub } from "./zip.ts";

const {
  author,
  destinationFolder,
  filename,
  id,
  language,
  publisher,
  source,
  sourceFolder,
  title,
  verbose,
} = await getMeta();

const log = (msg: string) => {
  if (verbose) console.log(msg);
};

log("creating pages");

const fileTree = await createPagesAndGetToc(
  sourceFolder,
  destinationFolder + "/epub",
);

const getFiles = (fileTree: FileTree[]): string[] =>
  fileTree.map((d) => {
    const fromChildren = getFiles(d.children || []);
    return [d.xhtml, ...fromChildren];
  })
    .flat()
    .map(getRelativePath);

log("writing content.opf");

await Deno.writeTextFile(
  destinationFolder + "/epub/content.opf",
  contentOpfFile({
    id,
    author,
    publisher,
    title,
    language,
    source,
    files: getFiles(fileTree),
  }),
);

log("writing toc.xhtml");

await Deno.writeTextFile(
  destinationFolder + "/epub/toc.xhtml",
  tocXhtmlFile({
    id,
    title,
    language,
    fileTree: fileTree,
  }),
);

log("writing toc.ncx");

await Deno.writeTextFile(
  destinationFolder + "/epub/toc.ncx",
  tocNcxFile({
    id,
    title,
    language,
    fileTree,
  }),
);

log("writing title page");

await Deno.writeTextFile(
  destinationFolder + "/epub/0000-title.xhtml",
  sectionXhtmlFile(title, author),
);

await Promise.all(otherFiles.map(async (d) => {
  log("writing " + d.fileName);
  if (d.folder) {
    await Deno.mkdir(destinationFolder + "/" + d.folder);
  }
  await Deno.writeTextFile(
    destinationFolder +
      (d.folder ? `/${d.folder}/${d.fileName}` : `/${d.fileName}`),
    d.content,
  );
}));

log("creating epub");

await createEpub(destinationFolder, filename, log);

log("removing temporary folder");

await Deno.remove(destinationFolder, { recursive: true });

log("done creating " + filename + ".epub");
