/**
 * @typedef {'null'|'undefined'|'string'|'number'|'boolean'|'function'|'object'|'array'|'class'|'nan'|String} getTypeResult
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
 * @param {{once: *, rootHandler: typeHandler|typeFilterHandler|Array, type: getTypeResult, className: String}} options
 * */
/**
 * @typedef {handler|yes|no|on|off|error|type|typeClass|call|recheck|typeFilterCustomHandler} typeFilterHandler
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
 * */
function typeFilter (value, handlers, options) {
  if (!handlers) return getType(value);
  var optionsType = typeof options;
  if (options === true) {
    options = {
      once: yes,
      rootHandler: handlers
    }
  } else if (optionsType === 'function') {
    options = {
      once: typeFilter([options, {
        function: [call, recheck]
      }], handler, {
        rootHandler: options.rootHandler || handlers
      }),
      rootHandler: handlers
    }
  } else if (optionsType === 'object') {
    options = {
      once: options.once,
      rootHandler: options.rootHandler || handlers
    }
  } else {
    options = {
      rootHandler: handlers
    }
  }
  if (handlers instanceof Array) {
    var once = options.once;
    if (once) {
      var checkOnce = typeof once === 'function' ? once : yes;
      for (let i = 0; i < handlers.length; i++) {
        var result = typeFilter(value, handlers[i], options);
        if (checkOnce(result)) {
          return result
        }
      }
      return undefined
    }
    var reduceOptions = {
      rootHandler: options.rootHandler,
      once: options.once
    };
    return handlers.reduce(function (value, handler) {
      return typeFilter(value, handler, reduceOptions)
    }, value)
  }
  var type = options.type || (options.type = getType(value));
  var className = options.className;
  className = typeof className === 'string' ? className : options.className = type === 'class' ? value.constructor.name : '';
  if (typeof handlers === 'function') {
    options.handler = handlers;
    return handlers(value, options);
  }
  var currentHandler = handlers[className || type];
  if (currentHandler) return typeFilter(value, currentHandler, options);
  var other = handlers.other;
  if (other) return other(value, options);
  return value
}
module.exports = typeFilter;
typeFilter.typeFilter = typeFilter;
// main handlers
var yes = require('./handlers/yes');
var on = require('./handlers/on');
var handler = require('./handlers/handler');
var call = require('./handlers/call');
var recheck = require('./handlers/recheck');
typeFilter.recheck = recheck;
typeFilter.yes = yes;
typeFilter.call = call;
typeFilter.handler = handler;
typeFilter.on = on;
// custom handlers
setHandler('no');
setHandler('off');
setHandler('type');
setHandler('typeClass');
setHandler('error');
function setHandler (name) {
  Object.defineProperty(typeFilter, name, {
    get: function () {
      return require('./handlers/' + name);
    }
  });
}
