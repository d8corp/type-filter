var typeFilter = require('../index');
module.exports = function handler (handler) {
  return function (value) {
    typeFilter(value, handler)
  }
};
