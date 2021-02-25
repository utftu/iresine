const path = require('path');
const getConfig = require('../../getWebpackConfig.cjs');

const configs = [
  {
    entry: path.join(__dirname, './src/index.js'),
    libraryTarget: 'module',
    dirname: path.join(__dirname, 'dist', 'esm'),
    filename: 'index.mjs',
  },
  {
    entry: path.join(__dirname, './src/index.js'),
    libraryTarget: 'commonjs2',
    dirname: path.join(__dirname, 'dist', 'cjs'),
    filename: 'index.cjs',
  },
];

module.exports = configs.map((config) => getConfig(config));
