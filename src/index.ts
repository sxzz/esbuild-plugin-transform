import { existsSync } from 'node:fs'
import path from 'node:path'
import { rm, writeFile } from 'node:fs/promises'
import {
  type OnLoadArgs,
  type OnLoadOptions,
  type OnLoadResult,
  type Plugin,
  type PluginBuild,
} from 'esbuild'
import { type Options, resolveOptions } from './options'
import { backupFile, createTempFile } from './utils'

export const Transform = (userOptions: Options = {}): Plugin => {
  const options = resolveOptions(userOptions)
  const onLoads: Parameters<PluginBuild['onLoad']>[] = []

  return {
    name: 'esbuild-plugin-transform',
    async setup(build) {
      for (const plugin of options.plugins) {
        await plugin.setup({
          ...build,
          onLoad(...args) {
            onLoads.push(args)
          },
        })
      }

      build.onLoad(
        { filter: options.filter, namespace: options.namespace },
        async (args) => {
          const isRealModule = existsSync(args.path)

          let transformedPath: [string, string] | undefined
          let transformed: OnLoadResult = { pluginData: args.pluginData }
          let contents: string | Uint8Array | undefined

          function getTransformedFile() {
            // Returns original path when first plugin
            if (!contents) return args.path

            if (!transformedPath) {
              if (isRealModule) {
                const dirName = path.dirname(args.path)
                const filename = path.basename(args.path)
                transformedPath = backupFile(
                  dirName,
                  'transformed',
                  filename,
                  contents
                )
              } else {
                transformedPath = createTempFile(args.path, contents)
              }
            }
            return transformedPath[1]
          }

          for (const [options, onLoad] of onLoads) {
            if (!filterOnLoad(options, args)) continue

            const result = await onLoad({
              ...args,
              get path() {
                return getTransformedFile()
              },
              pluginData: transformed.pluginData,
            })
            if (!result || typeof result.contents === 'undefined') continue

            transformed = result
            contents = result.contents

            if (transformedPath)
              await writeFile(transformedPath[1], contents, 'utf-8')
          }

          if (transformedPath) {
            await rm(transformedPath[0], {
              recursive: true,
              force: true,
            })
          }

          if (typeof transformed.contents === 'undefined') return
          return transformed
        }
      )
    },
  }
}

function filterOnLoad(options: OnLoadOptions, args: OnLoadArgs) {
  const matchNamespace =
    typeof options.namespace !== 'undefined'
      ? options.namespace === args.namespace
      : true
  return options.filter.test(args.path) && matchNamespace
}
