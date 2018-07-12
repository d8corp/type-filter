var typeFilter = require('../index.js');
module.exports = function handler (handler, options) {
  return options.rootHandler = function (value) {
    return typeFilter(value, handler, options)
  }
};
