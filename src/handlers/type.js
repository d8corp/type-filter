console.warn('importing by "type-filter/src/handlers/type" is deprecated, please use "type-filter/handlers/type" for that');
module.exports = function type (value, options) {
  return options.type
};
