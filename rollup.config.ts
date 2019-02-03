import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from 'rollup-plugin-typescript2'

const pkg = require('./package.json')

const env = process.env.NODE_ENV
let config

if (env === 'cjs') {
  config = {
    output: { file: pkg.main, format: 'cjs', sourcemap: true },
    typescript: { useTsconfigDeclarationDir: true },
  }
} else {
  config = {
    output: { file: pkg.module, format: 'es', sourcemap: true },
    typescript: {
      tsconfig: 'tsconfig.json',
      tsconfigOverride: { compilerOptions: { target: 'es6' } },
      useTsconfigDeclarationDir: true,
    },
  }
}

export default {
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  input: `src/main.ts`,
  output: [config.output],
  plugins: [
    typescript(config.typescript),
    commonjs(),
    resolve({
      jsnext: true,
    }),
    sourceMaps(),
  ],
  watch: {
    include: 'src/**',
  },
}
