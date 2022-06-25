import fs from 'fs'
import { copyFile } from 'fs/promises'
import path from 'path'

export async function backupFile(filePath: string, suffix: string) {
  const dir = path.dirname(filePath)
  const ext = path.extname(filePath)
  const name = path.basename(filePath, ext)

  let id = 0
  let backupPath: string

  do {
    backupPath = path.resolve(dir, `${name}_${suffix}${id}${ext}`)
    if (fs.existsSync(backupPath)) {
      id++
      continue
    }

    await copyFile(filePath, backupPath, fs.constants.COPYFILE_EXCL)
    return backupPath
    // eslint-disable-next-line no-constant-condition
  } while (true)
}
