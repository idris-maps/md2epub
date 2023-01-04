import { JSZip } from './deps.ts'

const readFolder = async (path: string) => {
  const dirs = []
  const files = []
  try {
    const content = Deno.readDir(path)
    for await (const d of content) {
      if (d.isDirectory) { dirs.push(d.name) }
      if (d.isFile) { files.push(d.name) }
    }
    return { dirs, files }
  } catch {
    return { dirs, files }
  }
}

const addFile = async (zip: JSZip, name: string, path: string[] = []) => {
  const file = await Deno.readTextFile([...path, name].join('/'))
  zip.addFile(name, file)
}

const zipFolder = async (folder: string, path: string[] = [], zip?: JSZip, ) => {
  const f = zip ? zip.folder(folder) : new JSZip()
  const { dirs, files } = await readFolder([...path, folder].join('/'))
  await Promise.all(files.map(d => addFile(f, d, [...path, folder])))
  await Promise.all(dirs.map(d => zipFolder(d, [...path, folder], f)))
  return f
}

export const createEpub = async (folder: string, name: string) => {
  const zip = await zipFolder(folder)
  return zip.writeZip(name + '.epub')
}
