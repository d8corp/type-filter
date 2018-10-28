var typeFilter = require('../typeFilter');
module.exports = function array (handler) {
  return function (array, options) {
    return array.map(function (value) {
      return typeFilter(value, handler, options)
    })
  }
};
