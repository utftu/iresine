'use strict';

if (process.env.NODE_ENV === 'development') {
  module.exports = require('./dev.cjs');
} else {
  module.exports = require('./prod.cjs');
}
