import { tmpdir } from 'os'
import fs, { copyFileSync, existsSync, writeFileSync } from 'fs'
import path from 'path'
import { ensureDirSync } from 'fs-extra'

function random() {
  return Math.trunc(Math.random() * 10000)
}

export function backupFile(
  baseDir: string,
  dirName: string,
  filename: string,
  contents?: Uint8Array | string
) {
  let id = random()
  let backupPath: string

  do {
    backupPath = path.resolve(baseDir, `${dirName}${id}`, filename)
    if (existsSync(backupPath)) {
      id++
      continue
    }

    ensureDirSync(path.dirname(backupPath))
    if (!contents) {
      const originalFile = path.resolve(baseDir, filename)
      copyFileSync(originalFile, backupPath, fs.constants.COPYFILE_EXCL)
    } else {
      writeFileSync(backupPath, contents, 'utf-8')
    }
    return backupPath
    // eslint-disable-next-line no-constant-condition
  } while (true)
}

const tempDir = tmpdir()
export function createTempFile(
  filePath: string,
  contents?: string | Uint8Array
) {
  const filename = path.isAbsolute(filePath) ? filePath.slice(1) : filePath
  return backupFile(tempDir, '', filename, contents ?? '')
}
