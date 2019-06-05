/**
 * @typedef {'null'|'undefined'|'string'|'number'|'boolean'|'function'|'object'|'array'|'class'|'nan'|String} getTypeResult
 * */
/** @typedef {Array<call|recheck>} callRecheck */
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
 * @param {{once: *, rootHandler: typeHandler|typeFilterHandler|Array, type: getTypeResult, className: String}} options
 * */
/**
 * @typedef {handler|yes|no|on|off|error|type|typeClass|call|recheck|callRecheck|typeFilterCustomHandler} typeFilterHandler
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
 /**
 * @typedef {Object|Function} options
 * @property {String} [className]
 * @property {getTypeResult} [type]
 * @property {Boolean|Function} [once]
 * @property {typeHandler|typeFilterHandler|Array} [rootHandler]
 * @property {typeHandler|typeFilterHandler|Array} [handler]
 */
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
 * @property {recheck} recheck
 * @property {callRecheck} callRecheck
 * */
function typeFilter (value, handlers, options) {
  if (!handlers) return getType(value);
  var optionsType = typeof options;
  var type, className, result;
  if (optionsType !== 'object') {
    if (options === true) {
      options = {
        once: typeFilter.yes,
        rootHandler: handlers
      }
    } else if (optionsType === 'function') {
      options = {
        once: typeFilter([options, {
          function: typeFilter.callRecheck
        }], typeFilter.handler, { rootHandler: handlers }),
        rootHandler: handlers
      }
    } else {
      options = {
        rootHandler: handlers
      }
    }
  } else if (!options.rootHandler) {
    options.rootHandler = handlers
  }
  if (handlers instanceof Array) {
    var once = options.once;
    var otherArguments = Array.prototype.slice.call(arguments, 3);
    if (once) {
      var checkOnce = typeof once === 'function' ? once : typeFilter.yes;
      for (let i = 0; i < handlers.length; i++) {
        result = typeFilter.apply(this, [value, handlers[i], options].concat(otherArguments));
        if (checkOnce(result)) {
          return result
        }
      }
      return undefined
    }
    type = options.type;
    className = options.className;
    result = value;
    for (let i = 0; i < handlers.length; i++) {
      options.type = undefined;
      options.className = undefined;
      result = typeFilter.apply(this, [result, handlers[i], options].concat(otherArguments))
    }
    options.type = type;
    options.className = className;
    return result
  }
  type = options.type || (options.type = getType(value));
  className = options.className || (
    options.className === '' ? '' : type === 'class' ? options.className = value.constructor.name : options.className = ''
  );
  var typeOfHandlers = typeof handlers;
  if (typeOfHandlers === 'function') {
    return handlers.apply(options.rootHandler, [value, options].concat(Array.prototype.slice.call(arguments, 3)));
  } else if (typeOfHandlers === 'object') {
    var currentHandler = handlers[className || type];
    if (currentHandler) return typeFilter.apply(this, [value, currentHandler, options].concat(Array.prototype.slice.call(arguments, 3)));
    var other = handlers.other;
    if (other) return other(value, options);
  }
  return value
}
module.exports = typeFilter;
typeFilter.typeFilter = typeFilter;
typeFilter.yes = require('./handlers/yes');
typeFilter.handler = require('./handlers/handler');
typeFilter.callRecheck = require('./handlers/callRecheck');
