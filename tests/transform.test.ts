/* eslint-disable unicorn/prefer-string-replace-all */

import path from 'path'
import { describe, expect, test } from 'vitest'
import { PluginWrapper, fixtures, getOutput } from './_utils'
import type { Plugin } from 'esbuild'

describe('transform', () => {
  test('basic', async () => {
    const plugin1 = PluginWrapper('plugin1', (contents) =>
      contents.replace(/foo/g, 'bar')
    )
    const plugin2 = PluginWrapper('plugin2', (contents) =>
      contents.replace(/bar/g, 'expected')
    )

    const contents = await getOutput(path.resolve(fixtures, 'basic.ts'), [
      plugin1,
      plugin2,
    ])

    expect(contents).toMatchSnapshot()
    expect(contents).not.toMatch('foo')
    expect(contents).not.toMatch('bar')
    expect(contents).toMatch('expected')
  })

  test('virtual module', async () => {
    const pluginResolve: Plugin = {
      name: 'resolve',
      setup(build) {
        build.onResolve({ filter: /vmodule:foo/ }, () => ({
          path: '/vmodule/foo',
        }))
      },
    }
    const plugin1 = PluginWrapper(
      'plugin1',
      () => `export const foo = 'foo'`,
      /\/vmodule\/foo/
    )
    const plugin2 = PluginWrapper(
      'plugin2',
      (contents) => contents.replace(/foo/g, 'expected'),
      /\/vmodule\/foo/
    )

    const contents = await getOutput(
      path.resolve(fixtures, 'virtual-module.ts'),
      [pluginResolve, plugin1, plugin2]
    )

    expect(contents).toMatchSnapshot()
    expect(contents).not.toMatch('"foo"')
    expect(contents).toMatch('expected')
  })
})
