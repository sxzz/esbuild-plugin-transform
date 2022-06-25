import fs from 'fs'
import { unlink, writeFile } from 'fs/promises'
import { resolveOptions } from './options'
import { backupFile } from './utils'
import type { Options } from './options'
import type {
  OnLoadArgs,
  OnLoadOptions,
  OnLoadResult,
  Plugin,
  PluginBuild,
} from 'esbuild'

export const Transform = (userOptions: Options = {}): Plugin => {
  const options = resolveOptions(userOptions)
  const onLoads: Parameters<PluginBuild['onLoad']>[] = []

  return {
    name: 'pipe',
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
          const isRealModule = fs.existsSync(args.path)

          let transformedPath = args.path
          if (isRealModule) {
            transformedPath = await backupFile(args.path, 'transformed')
          }
          let transformed: OnLoadResult = { pluginData: args.pluginData }

          for (const [options, onLoad] of onLoads) {
            if (!filterOnLoad(options, args)) continue

            const result = await onLoad({
              ...args,
              path: transformedPath,
              pluginData: transformed.pluginData,
            })
            if (!result || typeof result.contents === 'undefined') continue

            transformed = result

            if (isRealModule)
              await writeFile(transformedPath, result.contents, 'utf-8')
          }

          if (fs.existsSync(transformedPath)) {
            await unlink(transformedPath)
          }

          if (!transformed.contents) return

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
