var typeFilter = require('../typeFilter');
module.exports = function handler (handler) {
  var otherArguments = Array.prototype.slice.call(arguments, 2);
  return function (value, options) {
    return typeFilter.apply(this, [value, handler, options].concat(otherArguments, Array.prototype.slice.call(arguments, 1)))
  }
};
