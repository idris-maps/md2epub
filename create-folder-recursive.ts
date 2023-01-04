const dirExists = async (dir: string) => {
  try {
    const _dir = Deno.readDir(dir)
    for await (const _z of _dir) { return }
    return true
  } catch {
    return false
  }
}

export const createFolderRecursive = async (parts: string[], path: string[] = []): Promise<void> => {
  if (!parts.length) { return }
  const [d, ...rest] = parts
  const folder = [...path, d].join('/')
  const exists = await dirExists(folder)

  if (exists) {
    return createFolderRecursive(rest, [...path, d])
  }
  await Deno.mkdir(folder, { recursive: true })
  return createFolderRecursive(rest, [...path, d])
}
