var typeFilter = require('../typeFilter');
module.exports = function recheck (value, options) {
  return typeFilter.apply(this, [value, options.rootHandler, options].concat(Array.prototype.slice.call(arguments, 3)));
};
