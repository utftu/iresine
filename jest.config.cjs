module.exports = {
  verbose: true,
  transform: {
    '\\.[cm]?js$': ['babel-jest', {configFile: './babel.config.cjs'}],
  },
};
