const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const getConfig = require('../../getWebpackConfig.cjs');

let configs = [
  // {
  //   entry: path.join(__dirname, './src/index.js'),
  //   libraryTarget: 'module',
  //   dirname: path.join(__dirname, 'dist', 'esm'),
  //   filename: 'dev.mjs',
  //   mode: 'development',
  // },
  // {
  //   entry: path.join(__dirname, './src/index.js'),
  //   libraryTarget: 'module',
  //   dirname: path.join(__dirname, 'dist', 'esm'),
  //   filename: 'prod.mjs',
  //   mode: 'production',
  // },
  {
    entry: path.join(__dirname, './src/index.js'),
    libraryTarget: 'commonjs2',
    dirname: path.join(__dirname, 'dist', 'cjs'),
    filename: 'dev.cjs',
    mode: 'development',
  },
  {
    entry: path.join(__dirname, './src/index.js'),
    libraryTarget: 'commonjs2',
    dirname: path.join(__dirname, 'dist', 'cjs'),
    filename: 'prod.cjs',
    mode: 'production',
  },
];

configs = configs.map((config) => getConfig(config));

configs.push(
  ...[
    {
      mode: 'development',
      plugins: [
        new CopyPlugin({
          patterns: [
            {
              from: path.join(__dirname, 'cjs-path.cjs'),
              to: path.join(__dirname, 'dist', 'cjs', 'index.cjs'),
            },
          ],
          options: {
            concurrency: 100,
          },
        }),
      ],
    },
  ]
);

module.exports = configs;
// console.log(JSON.stringify(configs.map((config) => getConfig(config))))

// module.exports = [
//   {
//     entry: '/Users/a.malyuta/projects/iresene/packages/helpers/src/index.js',
//     output: {
//       filename: 'index.jsx',
//       path: '/Users/a.malyuta/projects/iresene/packages/helpers/dist/hehehe',
//       libraryTarget: 'commonjs2',
//     },
//     devtool: 'source-map',
//     mode: 'development',
//     module: {
//       rules: [
//         {
//           use: {
//             loader: 'babel-loader',
//             options: {
//               presets: ['@babel/preset-react'],
//               plugins: [
//                 ['@babel/plugin-proposal-class-properties', {loose: true}],
//               ],
//             },
//           },
//         },
//       ],
//     },
//     experiments: {outputModule: true},
//   },
// {
//   entry: '/Users/a.malyuta/projects/iresene/packages/helpers/src/index.js',
//   output: {
//     filename: 'index.cjs',
//     path: '/Users/a.malyuta/projects/iresene/packages/helpers/dist/cjs',
//     libraryTarget: 'commonjs2',
//   },
//   devtool: 'source-map',
//   mode: 'production',
//   module: {
//     rules: [
//       {
//         test: {},
//         exclude: {},
//         use: {
//           loader: 'babel-loader',
//           options: {
//             presets: ['@babel/preset-react'],
//             plugins: [
//               ['@babel/plugin-proposal-class-properties', {loose: true}],
//             ],
//           },
//         },
//       },
//     ],
//   },
//   experiments: {outputModule: true},
// },
// ];
