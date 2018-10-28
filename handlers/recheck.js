var typeFilter = require('../typeFilter');
module.exports = function recheck (value, options) {
  return typeFilter(value, options.rootHandler, options);
};
