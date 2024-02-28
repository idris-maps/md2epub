export const sectionXhtmlFile = (title: string, subtitle?: string) =>
  `
<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="sv-SE" xml:lang="sv-SE">
  <head>
    <title>${title}</title>
  </head>
  <body>
    <h1>${title}</h1>${subtitle ? `<h2>${subtitle}</h2>` : ""}
  </body>
</html>
`.trim();
