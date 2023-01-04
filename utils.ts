import { replaceDiacritics } from './deps.ts'

export const init = <T>(arr: T[]): T[] => {
  const result: T[] = []
  arr.forEach((d, i) => {
    if (i + 1 < arr.length) {
      result.push(d)
    }
  })
  return result
}

export const last = <T>(arr: T[]): T => arr[arr.length - 1] 

export const tail = <T>(arr: T[]): T[] => {
  const [_, ...rest] = arr
  return rest
}

export const isAlphaNum = (d: string) => 'abcdefghijklmnopqrstuvwxyz0123456789/'.includes(d)

export const slugify = (d: string) => Array.from(replaceDiacritics(d.toLowerCase()))
  .map(letter => isAlphaNum(letter) ? letter : '-')
  .join('')
  .split('-')
  .filter(d => d !== '')
  .join('-')

export const getFileId = (xhtml: string) =>
  xhtml.split('/').join('-').split('.xhtml')[0]

export const getRelativePath = (xhtml: string) =>
 tail(xhtml.split('/')).join('/')

// deno-lint-ignore no-control-regex
const unsafeInXml = /[\u{0000}-\u{0008}\u{D800}-\u{DFFF}\u{FFFE}-\u{FFFF}]/um;

export const sanitizeXmlString = (input: string, replacement = '') =>
  input.replace(unsafeInXml, replacement);
