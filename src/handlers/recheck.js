console.warn('importing by "type-filter/src/handlers/recheck" is deprecated, please use "type-filter/handlers/recheck" for that');
var typeFilter = require('../index.js');
module.exports = function recheck (value, options) {
  return typeFilter(value, options.rootHandler, options);
};
