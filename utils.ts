export const init = <T>(arr: T[]): T[] => {
  const result: T[] = [];
  arr.forEach((d, i) => {
    if (i + 1 < arr.length) {
      result.push(d);
    }
  });
  return result;
};

export const last = <T>(arr: T[]): T => arr[arr.length - 1];

export const getRelativePath = (xhtml: string) => xhtml.split("/").slice(-1)[0];

const unsafeForXml =
  // deno-lint-ignore no-control-regex
  /[\u{0000}-\u{0008}\u{D800}-\u{DFFF}\u{FFFE}-\u{FFFF}-&]/um;

export const sanitizeXmlString = (input = "", replacement = "") =>
  input.replace(unsafeForXml, replacement);
