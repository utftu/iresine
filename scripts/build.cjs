const helpersConfigs = require('../packages/helpers/webpack.config.cjs');
const objectPathConfigs = require('../packages/object-path/webpack.config.cjs');
const coreConfigs = require('../packages/core/webpack.config.cjs');
const reactQueryWrapperConfigs = require('../packages/react-query-wrapper/webpack.config.cjs');

module.exports = [
  ...helpersConfigs,
  ...objectPathConfigs,
  ...coreConfigs,
  // ...reactQueryWrapperConfigs
];
