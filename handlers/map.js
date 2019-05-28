var typeFilter = require('../typeFilter');
module.exports = function map (handler) {
  return function (array) {
    return array.map(function (value) {
      return typeFilter(value, handler)
    })
  }
};
