var typeFilter = require('../index.js');
module.exports = function type (value, options) {
  return options.type || typeFilter(value)
};
