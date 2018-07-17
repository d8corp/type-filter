var typeFilter = require('../index.js');
module.exports = function typeClass (value, options) {
  var className = options.className;
  if (className) return className;
  var type = options.type || typeFilter(value);
  if (className === '') return type;
  return type === 'class' ? value.constructor.name : type;
};
