import path from 'node:path'
import { TextDecoder } from 'node:util'
import { readFile } from 'node:fs/promises'
import { type Plugin, build } from 'esbuild'
import { Transform } from '../src'

export const fixtures = path.resolve(__dirname, 'fixtures')

export async function getOutput(entry: string, plugins: Plugin[]) {
  const output = await build({
    entryPoints: [entry],
    write: false,
    plugins: [Transform({ plugins })],
    bundle: true,
  })
  return new TextDecoder().decode(output.outputFiles[0].contents).trim()
}

export function PluginWrapper(
  name: string,
  transformer: (contents: string) => Promise<string> | string,
  filter = /.*/
): Plugin {
  return {
    name,
    setup: (build) => {
      build.onLoad({ filter }, async ({ path }) => {
        const contents = await readFile(path, 'utf-8').catch(() => '')
        return {
          contents: await transformer(contents),
          loader: 'ts',
        }
      })
    },
  }
}
