import type { FileTree, TocProps } from "./toc-xhtml-file.ts";
import { getFileId, getRelativePath, sanitizeXmlString } from "./utils.ts";

const INDENT = "  ";

const renderNav = (
  { label, xhtml, children, playOrder }: FileTree,
  indent = INDENT,
): string => {
  const childs = children
    ? children.map((d) => renderNav(d, indent + INDENT))
    : [];
  return [
    `<navPoint id="${getFileId(xhtml)}" playOrder="${playOrder}">`,
    `${INDENT}<navLabel><text>${sanitizeXmlString(label)}</text></navLabel>`,
    `${INDENT}<content src="${getRelativePath(xhtml)}"/>`,
    ...childs,
    `</navPoint>`,
  ].map((d) => INDENT + d).join("\n");
};

export const tocNcxFile = (data: TocProps) =>
  `
<?xml version="1.0" encoding="utf-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="${data.language}">
<head>
  <meta content="${data.id}" name="dtb:uid"/>
</head>
<docTitle>
  <text>${sanitizeXmlString(data.title)}</text>
</docTitle>
<navMap id="navmap">
  <navPoint id="${getFileId("0000-title.xhtml")}" playOrder="1">
    <navLabel><text>${sanitizeXmlString(data.title)}</text></navLabel>
    <content src="0000-title.xhtml"/>
  </navPoint>
${data.fileTree.map((d) => renderNav(d, INDENT)).join("\n")}
</navMap>
</ncx>
`.trim();
