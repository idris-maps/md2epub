import { replaceDiacritics } from "./deps.ts";

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

export const tail = <T>(arr: T[]): T[] => {
  const [_, ...rest] = arr;
  return rest;
};

export const isAlphaNum = (d: string) =>
  "abcdefghijklmnopqrstuvwxyz0123456789/".includes(d);

export const slugify = (d: string) =>
  Array.from(replaceDiacritics(d.toLowerCase()))
    .map((letter) => isAlphaNum(letter) ? letter : "-")
    .join("")
    .split("-")
    .filter((d) => d !== "")
    .join("-");

export const getFileId = (xhtml: string) =>
  xhtml.split("/").join("-").split(".xhtml")[0];

export const getRelativePath = (xhtml: string) =>
  tail(xhtml.split("/")).join("/");

const unsafeForXml =
  // deno-lint-ignore no-control-regex
  /[\u{0000}-\u{0008}\u{D800}-\u{DFFF}\u{FFFE}-\u{FFFF}-&]/um;

export const sanitizeXmlString = (input = "", replacement = "") =>
  input.replace(unsafeForXml, replacement);

export const shortenString = (str: string, maxLength: number) =>
  str.length > maxLength ? str.slice(0, maxLength - 1) + "…" : str;

export const shortenSentence = (str: string, maxLength: number) => {
  if (str.length <= maxLength) return str;
  const words = str.split(" ");
  const result = words.reduce((r, w) => {
    const next = r + " " + w;
    return next.length < maxLength ? next : r;
  }, "");
  return result.trim().length === 0
    ? shortenString(str, maxLength)
    : result + "…";
};
