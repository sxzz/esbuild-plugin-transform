import { tmpdir } from 'os'
import { existsSync, writeFileSync } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import { ensureDirSync } from 'fs-extra'

export function backupFile(
  baseDir: string,
  dirName: string,
  filename: string,
  contents: Uint8Array | string
): [string, string] {
  let backupPath: string

  do {
    const id = randomUUID()
    backupPath = path.resolve(baseDir, `${dirName}${id}`, filename)
    if (existsSync(backupPath)) {
      continue
    }

    ensureDirSync(path.dirname(backupPath))
    writeFileSync(backupPath, contents, 'utf-8')

    return [
      path.resolve(baseDir, `${dirName}${id}`.split(path.sep)[0]),
      backupPath,
    ]
    // eslint-disable-next-line no-constant-condition
  } while (true)
}

const tempDir = tmpdir()
export function createTempFile(
  filePath: string,
  contents: string | Uint8Array
) {
  return backupFile(tempDir, '', path.basename(filePath), contents)
}
