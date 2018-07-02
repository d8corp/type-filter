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
 * */
/**
 * @typedef {Object} typeHandler
 * @property {typeHandler|typeFilterHandler|Array} [undefined]
 * @property {typeHandler|typeFilterHandler|Array} [string]
 * @property {typeHandler|typeFilterHandler|Array} [number]
 * @property {typeHandler|typeFilterHandler|Array} [boolean]
 * @property {typeHandler|typeFilterHandler|Array} [function]
 * @property {typeHandler|typeFilterHandler|Array} [null]
 * @property {typeHandler|typeFilterHandler|Array} [array]
 * @property {typeHandler|typeFilterHandler|Array} [object]
 * @property {typeHandler|typeFilterHandler|Array} [symbol]
 * @property {typeHandler|typeFilterHandler|Array} [class]
 * @property {typeHandler|typeFilterHandler|Array} [other]
 * */
/**
 * @typedef {Object} options
 * @property {String} [className]
 * @property {getTypeResult|String} [type]
 * @property {Boolean} [once]
 * */
/**
 * @param {*} [value]
 * @param {typeHandler|typeFilterHandler|Array} [handlers]
 * @param {options} [options]
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
function typeFilter (value, handlers, options) {
  if (!options) {
    options = {}
  }
  if (!handlers) return getType(value);
  if (handlers instanceof Array) {
    if (options.once) {
      for (let i = 0; i < handlers.length; i++) {
        var result = typeFilter(value, handlers[i], options);
        if (result) {
          return result
        }
      }
    }
    return handlers.reduce(function (value, handler) {
      return typeFilter(value, handler, options)
    }, value)
  }
  var type = options.type || getType(value);
  var className = options.className || (type === 'class' ? value.constructor.name : '');
  if (typeof handlers === 'function') return handlers(value, type, className);
  var handler = handlers[className || type];
  if (handler) return typeFilter(value, handler, {
    type: type,
    className: className,
    once: options.once
  });
  var other = handlers.other;
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
