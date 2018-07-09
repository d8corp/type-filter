var yes = require('./handlers/yes');
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
 * @property {recheck} recheck
 * */
function typeFilter (value, handlers, options) {
  if (!handlers) return getType(value);
  if (handlers === recheck) {
    if (!options || !options.heightHandler) {
      throw Error('you can not use recheck as main handler')
    }
    return typeFilter(value, options.heightHandler, options);
  }
  if (options === true) {
    options = {
      once: true,
      heightHandler: handlers
    }
  } else if (typeof options === 'function') {
    options = {
      once: options,
      heightHandler: handlers
    }
  } else if (!options) {
    options = {
      heightHandler: handlers
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
      heightHandler: options.heightHandler
    };
    return handlers.reduce(function (value, handler) {
      return typeFilter(value, handler, reduceOptions)
    }, value)
  }
  var type = options.type || getType(value);
  var className = options.className || (type === 'class' ? value.constructor.name : '');
  if (typeof handlers === 'function') return handlers(value, type, className);
  var handler = handlers[className || type];
  if (handler) return typeFilter(value, handler, {
    type: type,
    className: className,
    once: options.once,
    heightHandler: options.heightHandler
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
var recheck = {};
typeFilter.recheck = recheck;
typeFilter.yes = yes;
setHandler('no');
setHandler('on');
setHandler('off');
setHandler('call');
setHandler('type');
setHandler('typeClass');
setHandler('error');
setHandler('handler');
module.exports = typeFilter;
