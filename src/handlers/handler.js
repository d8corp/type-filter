var typeFilter = require('../index.js');
module.exports = function handler (handler, options) {
  return options.rootHandler = function (value) {
    options.type = undefined;
    options.typeClass = undefined;
    return typeFilter(value, handler, options)
  }
};
