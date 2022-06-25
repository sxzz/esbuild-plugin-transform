/* eslint-disable unicorn/prefer-string-replace-all */

import path from 'path'
import { TextDecoder } from 'util'
import { readFile } from 'fs/promises'
import { expect, test } from 'vitest'
import { build } from 'esbuild'
import { Transform } from '../src'
import type { Plugin } from 'esbuild'

const fixtures = path.resolve(__dirname, 'fixtures')

async function getOutput(entry: string, plugins: Plugin[]) {
  const output = await build({
    entryPoints: [entry],
    write: false,
    plugins: [Transform({ plugins })],
  })
  return new TextDecoder().decode(output.outputFiles[0].contents).trim()
}

function PluginWrapper(
  name: string,
  transformer: (contents: string) => Promise<string> | string
): Plugin {
  return {
    name,
    setup: (build) => {
      build.onLoad({ filter: /\.ts$/ }, async ({ path }) => {
        const contents = await readFile(path, 'utf-8')
        return {
          contents: await transformer(contents),
          loader: 'ts',
        }
      })
    },
  }
}

test('transform', async () => {
  const plugin1: Plugin = PluginWrapper('plugin1', (contents) =>
    contents.replace(/foo/g, 'bar')
  )
  const plugin2: Plugin = PluginWrapper('plugin2', (contents) =>
    contents.replace(/bar/g, 'baz')
  )

  const contents = await getOutput(path.resolve(fixtures, 'basic.ts'), [
    plugin1,
    plugin2,
  ])

  expect(contents).toMatchInlineSnapshot(
    `
    "\\"use strict\\";
    const baz = \\"baz\\";"
  `
  )
})
