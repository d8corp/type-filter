var typeFilter = require('../index.js');
module.exports = function recheck (value, options) {
  return typeFilter(value, options.rootHandler, options);
};
