import { type OnLoadOptions, type Plugin } from 'esbuild'

export interface Options extends Partial<OnLoadOptions> {
  namespace?: string
  plugins?: Plugin[]
}

export type OptionsResolved = Omit<Required<Options>, 'namespace'> & {
  namespace?: undefined | string
}

export function resolveOptions(options: Options): OptionsResolved {
  return {
    filter: /.*/,
    namespace: undefined,
    plugins: [],
    ...options,
  }
}
