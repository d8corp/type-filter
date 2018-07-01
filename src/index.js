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
 * @callback typeFilterCustomHandler
 * @param {*} value
 * @param {getTypeResult} type
 * @param {String} className
 * */
/**
 * @typedef {handler|yes|no|on|off|error|type|typeClass|call|typeFilterCustomHandler} typeFilterHandler
/**
 * @typedef {Object} typeHandler
 * @property {typeHandler|Array|typeFilterHandler} [undefined]
 * @property {typeHandler|Array|typeFilterHandler} [string]
 * @property {typeHandler|Array|typeFilterHandler} [number]
 * @property {typeHandler|Array|typeFilterHandler} [boolean]
 * @property {typeHandler|Array|typeFilterHandler} [function]
 * @property {typeHandler|Array|typeFilterHandler} [null]
 * @property {typeHandler|Array|typeFilterHandler} [array]
 * @property {typeHandler|Array|typeFilterHandler} [object]
 * @property {typeHandler|Array|typeFilterHandler} [symbol]
 * @property {typeHandler|Array|typeFilterHandler} [class]
 * @property {typeHandler|Array|typeFilterHandler} [other]
 * */
/**
 * @param {*} [value]
 * @param {typeHandler|typeFilterHandler|Array} [options]
 * @param {String} [type]
 * @param {String} [className]
 * @property {yes} yes
 * @property {no} no
 * @property {on} on
 * @property {off} off
 * @property {call} call
 * @property {type} type
 * @property {typeClass} typeClass
 * @property {error} error
 * @property {handler} handler
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
setHandler('handler');
module.exports = typeFilter;
