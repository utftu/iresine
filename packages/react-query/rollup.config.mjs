import {babel} from '@rollup/plugin-babel';
import babelConfig from '../../babel.config.cjs';
import {terser} from 'rollup-plugin-terser';
import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = [
  {
    input: join(__dirname, '../../cjs-path.cjs'),
    output: {
      file: join(__dirname, 'dist/cjs/index.cjs'),
      format: 'cjs',
    },
  },
  {
    input: join(__dirname, 'src/index.js'),
    output: {
      file: join(__dirname, 'dist/cjs/dev.cjs'),
      format: 'cjs',
    },
    plugins: [
      babel({
        babelHelpers: 'bundled',
        ...babelConfig,
      }),
    ],
    external: ['@iresine/helpers', '@iresine/object-path'],
  },
  {
    input: join(__dirname, 'src/index.js'),
    output: {
      file: join(__dirname, 'dist/cjs/prod.cjs'),
      format: 'cjs',
    },
    plugins: [
      babel({
        babelHelpers: 'bundled',
        ...babelConfig,
      }),
      terser(),
    ],
    external: ['@iresine/helpers', '@iresine/object-path'],
  },
  {
    input: join(__dirname, 'src/index.js'),
    output: {
      file: join(__dirname, 'dist/esm/dev.mjs'),
      format: 'esm',
    },
    plugins: [
      babel({
        babelHelpers: 'bundled',
        ...babelConfig,
      }),
    ],
    external: ['@iresine/helpers', '@iresine/object-path'],
  },
  {
    input: join(__dirname, 'src/index.js'),
    output: {
      file: join(__dirname, 'dist/esm/prod.mjs'),
      format: 'esm',
    },
    plugins: [
      babel({
        babelHelpers: 'bundled',
        ...babelConfig,
      }),
      terser(),
    ],
    external: ['@iresine/helpers', '@iresine/object-path'],
  },
];

export default config;
