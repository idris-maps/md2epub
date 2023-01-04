import { getMeta } from './get-meta.ts'
import { createPagesAndGetToc } from './create-pages-and-get-toc.ts'
import { contentOpfFile } from './content-opf-file.ts'
import { tocXhtmlFile, FileTree } from './toc-xhtml-file.ts'
import { tocNcxFile } from './toc-ncx-file.ts'
import { otherFiles } from './other-files.ts'
import { getRelativePath } from './utils.ts'
import { sectionXhtmlFile } from './section-xhtml-file.ts'
import { createEpub } from './zip.ts'

const {
  id,
  sourceFolder,
  destinationFolder,
  author,
  publisher,
  title,
  language,
  source,
  filename,
} = await getMeta()
const fileTree = await createPagesAndGetToc(sourceFolder, destinationFolder  + '/epub')

const getFiles = (fileTree: FileTree[]): string[] =>
  fileTree.map(d => {
    const fromChildren = getFiles(d.children || [])
    return [d.xhtml, ...fromChildren]
  })
  .flat()
  .map(getRelativePath)

await Deno.writeTextFile(destinationFolder + '/epub/content.opf', contentOpfFile({
  id,
  author,
  publisher,
  title,
  language,
  source,
  files: getFiles(fileTree),
}))

await Deno.writeTextFile(destinationFolder + '/epub/toc.xhtml', tocXhtmlFile({
  id,
  title,
  language,
  fileTree: fileTree,
}))

await Deno.writeTextFile(destinationFolder + '/epub/toc.ncx', tocNcxFile({
  id,
  title,
  language,
  fileTree,
}))

await Deno.writeTextFile(destinationFolder + '/epub/0000-title.xhtml', sectionXhtmlFile(title, author))

await Promise.all(otherFiles.map(async d => {
  if (d.folder) {
    await Deno.mkdir(destinationFolder + '/' + d.folder)
  }
  await Deno.writeTextFile(
    destinationFolder + (d.folder ? `/${d.folder}/${d.fileName}` : `/${d.fileName}`),
    d.content
  )
}))

await createEpub(destinationFolder, filename)

await Deno.remove(destinationFolder, { recursive: true });
