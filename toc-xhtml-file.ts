import { getRelativePath } from './utils.ts'
export interface FileTree {
  label: string
  xhtml: string
  children?: FileTree[]
  playOrder: number
}

export interface TocProps {
  id: string
  title: string
  language: string
  fileTree: FileTree[]
}

const flattenTree = (fileTree: FileTree[]): Omit<FileTree,'children'>[] =>
  fileTree.reduce((r: Omit<FileTree,'children'>[], { label, xhtml, playOrder, children }): Omit<FileTree,'children'>[] => {
    r.push({ label, xhtml, playOrder })
    if (children) {
      flattenTree(children).forEach(d => { r.push(d) })
    }
    return r
  }, [])

export const tocXhtmlFile = (data: TocProps) => `
<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${data.language}" xml:lang="${data.language}">
	<head>
		<title>${data.title}</title>
	</head>
	<body epub:type="frontmatter">
		<nav id="toc" role="doc-toc" epub:type="toc">
			<h2 epub:type="title">${data.title}</h2>
      <ol>
        ${flattenTree(data.fileTree).map(d =>
          `        <li><a href="${getRelativePath(d.xhtml)}">${d.label}</a></li>`  
        ).join('\n')}
      </ol>
		</nav>
	</body>
</html>
`.trim()
