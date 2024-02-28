import { getMeta } from "./get-meta.ts";
import { contentOpfFile } from "./content-opf-file.ts";
import { tocXhtmlFile } from "./toc-xhtml-file.ts";
import { tocNcxFile } from "./toc-ncx-file.ts";
import { otherFiles } from "./other-files.ts";
import { sectionXhtmlFile } from "./section-xhtml-file.ts";
import { createEpub } from "./zip.ts";
import { addLabelToTree, getSourceFiles } from "./get-source-files.ts";
import { convertPage } from "./convert-page.ts";

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

log("reading source");

const { fileTree, filesToConvert, filesToCreate } = await getSourceFiles(
  sourceFolder,
  destinationFolder + "/epub",
);

log("converting pages");

for (const file of filesToConvert) {
  const { title } = await convertPage(file.source, file.destination);
  addLabelToTree(fileTree, file.destination, title);
}

log("creating pages");

const _filesToCreate = filesToCreate.map((file, i) => [
  file.destination,
  i === 0 ? sectionXhtmlFile(title, author) : sectionXhtmlFile(file.label),
]);

for (const [destination, content] of _filesToCreate) {
  await Deno.writeTextFile(destination, content);
}

log("writing content.opf");

const files = [
  ...filesToConvert,
  ...filesToCreate,
].map((d) => ({
  destination: d.destination.split("/").slice(-1)[0],
  id: d.id,
}));

await Deno.writeTextFile(
  destinationFolder + "/epub/content.opf",
  contentOpfFile({
    id,
    author,
    publisher,
    title,
    language,
    source,
    files,
  }),
);

log("writing toc.xhtml");

const destinationIdMap = new Map<string, string>();
for (const { id, destination } of files) {
  destinationIdMap.set(destinationFolder + "/epub/" + destination, id);
}

await Deno.writeTextFile(
  destinationFolder + "/epub/toc.xhtml",
  tocXhtmlFile({
    id,
    title,
    language,
    fileTree: fileTree.children || [],
    destinationIdMap,
  }),
);

log("writing toc.ncx");

await Deno.writeTextFile(
  destinationFolder + "/epub/toc.ncx",
  tocNcxFile({
    id,
    title,
    language,
    fileTree: fileTree.children || [],
    destinationIdMap,
  }),
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
