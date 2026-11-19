const esbuild = require('esbuild')

const esmConfig = {
  entryPoints: ['./src/main/ts/index.ts'],
  outdir: './target/esm',
  outExtension: { '.js': '.mjs' },
  bundle: true,
  packages: 'external',
  minify: false,
  sourcemap: true,
  platform: 'node',
  target: 'ES2020',
  format: 'esm',
  tsconfig: './tsconfig.json'
}

const cjsConfig = {
  ...esmConfig,
  outdir: './target/cjs',
  outExtension: { '.js': '.js' },
  target: 'es6',
  format: 'cjs',
}

const config = process.argv.includes('--cjs')
  ? cjsConfig
  : esmConfig

esbuild
  .build(config)
  .catch(() => process.exit(1))
