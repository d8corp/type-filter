var typeFilter = require('../typeFilter');
module.exports = function array (handler) {
  console.warn('array handler is deprecated, use map');
  return function (array, options) {
    return array.map(function (value) {
      return typeFilter(value, handler, options)
    })
  }
};
