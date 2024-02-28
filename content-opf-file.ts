import { sanitizeXmlString } from "./utils.ts";

export interface ContentProps {
  id: string;
  publisher: string;
  author: string;
  files: { destination: string; id: string }[];
  title: string;
  language: string;
  source: string;
}

export const contentOpfFile = (
  { id, files, publisher, author, title, language, source }: ContentProps,
) =>
  `
<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:opf="http://www.idpf.org/2007/opf" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
		<dc:identifier id="uid">${id}</dc:identifier>
		<dc:date>${new Date().toISOString()}</dc:date>
		<dc:publisher id="publisher">${sanitizeXmlString(publisher)}</dc:publisher>
    <dc:creator id="author">${sanitizeXmlString(author)}</dc:creator>
		<dc:title id="title">${sanitizeXmlString(title)}</dc:title>
		<dc:language>${sanitizeXmlString(language)}</dc:language>
		<dc:source>${sanitizeXmlString(source)}</dc:source>
	</metadata>
	<manifest>
${
    files.map((d) =>
      `		<item href="${d.destination}" id="epub-${d.id}" media-type="application/xhtml+xml"/>`
    ).join("\n")
  }
		<item href="toc.xhtml" id="toc.xhtml" media-type="application/xhtml+xml" />
		<item href="toc.ncx" id="ncx" media-type="application/x-dtbncx+xml"/>
	</manifest>
	<spine toc="ncx">
${files.map((d) => `		<itemref idref="epub-${d.id}"/>`).join("\n")}
	</spine>
</package>
`.trim();
