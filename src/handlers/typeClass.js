console.warn('importing by "type-filter/src/handlers/typeClass" is deprecated, please use "type-filter/handlers/typeClass" for that');
module.exports = function typeClass (value, options) {
  return options.className || options.type;
};
