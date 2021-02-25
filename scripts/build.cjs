const webpack = require('webpack');
const helpersConfigs = require('../packages/helpers/webpack.config.cjs');
const objectPathConfigs = require('../packages/object-path/webpack.config.cjs');
const coreConfigs = require('../packages/core/webpack.config.cjs');
const reactQueryWrapperConfigs = require('../packages/react-query-wrapper/webpack.config.cjs');

async function runSeq(configs) {
  for (const config of configs) {
    const [err, stats] = await new Promise((resolve) => webpack(config).run((...args) => resolve(args)));

    if (err) {
      console.error(err.stack || err);
      if (err.details) {
        console.error(err.details);
      }
      return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
      console.error(info.errors);
      return;
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings);
    }

    console.log(
      stats.toString({
        colors: true,
      })
    );
  }
}

(async () => {
  await runSeq([helpersConfigs, objectPathConfigs, coreConfigs, reactQueryWrapperConfigs]);
})();
