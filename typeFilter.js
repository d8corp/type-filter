var getType = require('./getType');
/**
 * @callback typeFilterOptionsAsFunction
 * @param {*} value
 * @param {getTypeResult} type
 * @param {String} className
 * */
/**
 * @typedef {Object} typeFilterOptionsAsObject
 * @property {typeFilterOptionsAsFunction} [undefined]
 * @property {typeFilterOptionsAsFunction} [string]
 * @property {typeFilterOptionsAsFunction} [number]
 * @property {typeFilterOptionsAsFunction} [boolean]
 * @property {typeFilterOptionsAsFunction} [function]
 * @property {typeFilterOptionsAsFunction} [null]
 * @property {typeFilterOptionsAsFunction} [array]
 * @property {typeFilterOptionsAsFunction} [object]
 * @property {typeFilterOptionsAsFunction} [symbol]
 * @property {typeFilterOptionsAsFunction} [class]
 * @property {typeFilterOptionsAsFunction} [other]
 * */
/**
 * @param {*} [value]
 * @param {typeFilterOptionsAsObject|typeFilterOptionsAsFunction|Array} [options]
 * @param {String} [type]
 * @param {String} [className]
 * */
function typeFilter (value, options, type, className) {
  if (!options) return getType(value);
  if (options instanceof Array) {
    return options.reduce(function (value, handler) {
      return typeFilter(value, handler)
    }, value)
  }
  if (type === undefined) {
    type = getType(value);
  }
  if (className === undefined) {
    className = type === 'class' ? value.constructor.name : '';
  }
  if (typeof options === 'function') return options(value, type, className);
  var handler = options[className || type];
  if (handler) return typeFilter(value, handler, type, className);
  var other = options.other;
  if (other) return other(value, type, className);
  return value
}
module.exports = typeFilter;
