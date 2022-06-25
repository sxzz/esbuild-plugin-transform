# esbuild-plugin-transform [![npm](https://img.shields.io/npm/v/esbuild-plugin-transform.svg)](https://npmjs.com/package/esbuild-plugin-transform)

[![Unit Test](https://github.com/sxzz/esbuild-plugin-transform/actions/workflows/unit-test.yml/badge.svg)](https://github.com/sxzz/esbuild-plugin-transform/actions/workflows/unit-test.yml)

Pipe transformation plugins for [esbuild](https://esbuild.github.io/).

Special support for plugins is not required.

Related issue: https://github.com/evanw/esbuild/issues/1902

## Install

```bash
npm i esbuild-plugin-transform
```

## Usage

```ts
import { build } from 'esbuild'
import { Transform } from 'esbuild-plugin-transform'

const plugins = [
  // ...
]
build({
  // ...
  plugins: [
    Transform({
      plugins,
    }),
  ],
})
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## Credits

Thanks to [esbuild-plugin-pipe](https://github.com/nativew/esbuild-plugin-pipe) for the inspiration.

## License

[MIT](./LICENSE) License © 2022 [三咲智子](https://github.com/sxzz)
