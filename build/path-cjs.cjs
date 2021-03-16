'use strict';

if (process.env.NODE_ENV === 'development') {
  module.exports = require('./dev.js');
} else {
  module.exports = require('./prod.js');
}
