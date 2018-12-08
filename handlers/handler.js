var typeFilter = require('../typeFilter');
module.exports = function handler (handler) {
  return function (value, options) {
    return typeFilter(value, handler, options)
  }
};
