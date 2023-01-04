import { getFileId } from './utils.ts'

export interface ContentProps {
	id: string
	publisher: string
	author: string
  files: string[]
	title: string
	language: string
	source: string
}

export const contentOpfFile = ({ id, files, publisher, author, title, language, source }: ContentProps) => `
<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uuid_id" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
		<dc:identifier id="uid">${id}</dc:identifier>
		<dc:date>${new Date().toISOString()}</dc:date>
		<dc:publisher id="publisher">${publisher}</dc:publisher>
    <dc:creator id="author">${author}</dc:creator>
		<dc:title id="title">${title}</dc:title>
		<dc:language>${language}</dc:language>
		<dc:source>${source}</dc:source>
	</metadata>
	<manifest>
		<item href="0000-title.xhtml" id="${getFileId('0000-title.xhtml')}" media-type="application/xhtml+xml"/>
${files.map(d => 
    `		<item href="${d}" id="${getFileId(d)}" media-type="application/xhtml+xml"/>`
).join('\n')}
		<item href="toc.xhtml" id="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
		<item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>
	</manifest>
	<spine toc="ncx">
${files.map(d =>
    `		<itemref idref="${getFileId(d)}"/>`
).join('\n')}
	</spine>
</package>
`.trim()
