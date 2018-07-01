/**
 * @typedef {'null'|'undefined'|'string'|'number'|'boolean'|'function'|'object'|'array'|'class'|'nan'} getTypeResult
 * */
/** @return {getTypeResult} */
function getType (value) {
  if (value === null) {
    return 'null'
  }
  var valueType = typeof value;
  if (valueType === 'number' && isNaN(value)) {
    return 'nan'
  }
  if (valueType !== 'object') {
    return valueType
  }
  if (!value.__proto__ || !value.__proto__.__proto__) {
    return 'object'
  }
  if (value instanceof Array) {
    return 'array'
  }
  return 'class'
}
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
 * @property {typeFilterOptionsAsFunction} yes
 * @property {typeFilterOptionsAsFunction} no
 * @property {typeFilterOptionsAsFunction} on
 * @property {typeFilterOptionsAsFunction} off
 * @property {typeFilterOptionsAsFunction} call
 * @property {typeFilterOptionsAsFunction} type
 * @property {typeFilterOptionsAsFunction} typeClass
 * @property {typeFilterOptionsAsFunction} error
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
typeFilter.typeFilter = typeFilter;
function setHandler (name) {
  Object.defineProperty(typeFilter, name, {
    get: function () {
      return require('./handlers/' + name);
    }
  });
}
setHandler('yes');
setHandler('no');
setHandler('on');
setHandler('off');
setHandler('call');
setHandler('type');
setHandler('typeClass');
setHandler('error');
module.exports = typeFilter;
