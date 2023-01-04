export const otherFiles = [
  { fileName: 'mimetype', content: 'application/epub+zip' },
  { folder: 'META-INF', fileName: 'container.xml', content: [
    '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0">',
    '  <rootfiles>',
    '    <rootfile full-path="epub/content.opf" media-type="application/oebps-package+xml"/>',
    '  </rootfiles>',
    '</container>',
  ].join('\n') }
]
