function getConfig({libraryTarget, dirname, entry, filename, mode}) {
  return {
    entry: entry,
    output: {
      filename: filename,
      path: dirname,
      libraryTarget: libraryTarget,
    },
    devtool: false,
    mode: mode,
    module: {
      rules: [
        {
          test: /\.(c|m)?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              ...require('./babel.config.cjs'),
            },
          },
        },
      ],
    },
    experiments: {outputModule: true, topLevelAwait: true},
  };
}

module.exports = getConfig;
