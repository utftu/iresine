function getConfig({libraryTarget, dirname, entry, filename}) {
  return {
    entry: entry,
    output: {
      filename: filename,
      path: dirname,
      libraryTarget: libraryTarget,
    },
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.(c|m)?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: [['@babel/plugin-proposal-class-properties', {loose: true}]],
            },
          },
        },
      ],
    },
    experiments: {outputModule: true},
  };
}

module.exports = getConfig;
