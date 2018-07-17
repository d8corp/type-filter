/* global it, describe, expect, jest */
var typeFilter = require('./index');
var yes = typeFilter.yes,
    no = typeFilter.no,
    on = typeFilter.on,
    off = typeFilter.off,
    call = typeFilter.call,
    type = typeFilter.type,
    typeClass = typeFilter.typeClass,
    error = typeFilter.error,
    recheck = typeFilter.recheck,
    handler = typeFilter.handler;

function MyClass () {}
var MyClass1 = MyClass;

describe('typeFilter', function () {
  it('get type', function () {
    expect(typeFilter(undefined)).toBe('undefined');
    expect(typeFilter(1)).toBe('number');
    expect(typeFilter(NaN)).toBe('nan');
    expect(typeFilter('1')).toBe('string');
    expect(typeFilter(false)).toBe('boolean');
    expect(typeFilter(function () {})).toBe('function');
    expect(typeFilter([])).toBe('array');
    expect(typeFilter({})).toBe('object');
    expect(typeFilter(Object.create(null))).toBe('object');
    expect(typeFilter(null)).toBe('null');
    expect(typeFilter(new MyClass())).toBe('class');
    expect(typeFilter(new Error())).toBe('class');
    expect(typeFilter()).toBe('undefined');
  });
  it('handler', function () {
    function addOne (value) {
      return value + 1
    }
    expect(typeFilter(1, addOne)).toBe(2);
    function getType (value, options) {
      return value + ': ' + options.type
    }
    expect(typeFilter(1, getType)).toBe('1: number');
    function getTypeOrClassName (value, options) {
      return value + ': ' + options.type + (options.className && '(' + options.className + ')')
    }
    expect(typeFilter({}, getTypeOrClassName)).toBe('[object Object]: object');
    expect(typeFilter(new MyClass(), getTypeOrClassName)).toBe('[object Object]: class(MyClass)');
    expect(typeFilter(new MyClass1(), getTypeOrClassName)).toBe('[object Object]: class(MyClass)');
  });
  it('handlerList', function () {
    function addOne (value) {
      return value + 1
    }
    function toInt (value) {
      return +value
    }
    function toString (value) {
      return value + ''
    }
    var addOneFromString = [toInt, addOne];
    expect(typeFilter('1', addOneFromString)).toBe(2);
    expect(typeFilter('1', [addOne, toInt])).toBe(11);
    expect(typeFilter('1', [toInt, [addOne, [addOne]]])).toBe(3);
    expect(typeFilter(1, [toString, [addOneFromString, [addOne]]])).toBe(3);
  });
  it('typeHandler', function () {
    var numberBlock = {
      number: no
    };
    expect(typeFilter(1, numberBlock)).toBe(undefined);
    expect(typeFilter('1', numberBlock)).toBe('1');
    expect(typeFilter(null, numberBlock)).toBe(null);
  });
  it('other', function () {
    var onlyNumber = {
      number: yes,
      other: no
    };
    expect(typeFilter(1, onlyNumber)).toBe(1);
    expect(typeFilter('1', onlyNumber)).toBe(undefined);
    expect(typeFilter(null, onlyNumber)).toBe(undefined);
  });
  it('class name filter', function () {
    var onlyError = {
      Error: yes,
      other: no
    };
    expect(typeFilter(new Error(), onlyError)).toEqual(new Error());
    expect(typeFilter(new MyClass(), onlyError)).toBe(undefined);
  });
  it('actions', function () {
    var call = jest.fn();
    var options = {
      string: function (value) {
        call(value)
      }
    };
    expect(call.mock.calls.length).toBe(0);
    typeFilter(1, options);
    expect(call.mock.calls.length).toBe(0);
    typeFilter('1', options);
    expect(call.mock.calls.length).toBe(1);
    expect(call.mock.calls[0][0]).toBe('1');
  });
  it('once', function () {
    function addOne (value) {
      return value + 1
    }
    function addTwo (value) {
      return value + 2
    }
    function addThree (value) {
      return value + 3
    }
    expect(typeFilter(1, [addOne, addTwo, addThree])).toBe(7);
    expect(typeFilter(1, [addOne, addTwo, addThree], true)).toBe(2);
    expect(typeFilter(1, [addOne, addTwo, addThree], function (value) {
      return value > 2
    })).toBe(3);
    expect(typeFilter(1, [addOne, addTwo, addThree], function (value) {
      return value > 4
    })).toBe(undefined);
    expect(typeFilter(1, [no, off, type, type])).toBe('string');
    expect(typeFilter(0, [yes], true)).toBe(undefined);
    expect(typeFilter(new MyClass(), [no, off, type, typeClass], true)).toBe('class');
    expect(typeFilter(new MyClass(), [no, off, typeClass, type], true)).toBe('MyClass');
  });
  it('default handler: no', function () {
    expect(typeFilter(1, no)).toBe(undefined);
    var noNumber = {
      number: no
    };
    expect(typeFilter(1, noNumber)).toBe(undefined);
    expect(typeFilter('2', noNumber)).toBe('2');
  });
  it('default handler: yes', function () {
    expect(typeFilter(1, yes)).toBe(1);
    var onlyNumber = {
      number: yes,
      other: no
    };
    expect(typeFilter(1, onlyNumber)).toBe(1);
    expect(typeFilter('2', onlyNumber)).toBe(undefined);
  });
  it('default handler: on, off', function () {
    expect(typeFilter(1, on)).toBe(true);
    expect(typeFilter(1, off)).toBe(false);
    var isNumber = {
      number: on,
      other: off
    };
    expect(typeFilter(1, isNumber)).toBe(true);
    expect(typeFilter('2', isNumber)).toBe(false);
  });
  it('default handler: type', function () {
    expect(typeFilter(undefined, type)).toBe('undefined');
    expect(typeFilter(1, type)).toBe('number');
    expect(typeFilter(NaN, type)).toBe('nan');
    expect(typeFilter('1', type)).toBe('string');
    expect(typeFilter(false, type)).toBe('boolean');
    expect(typeFilter(function () {}, type)).toBe('function');
    expect(typeFilter([], type)).toBe('array');
    expect(typeFilter({}, type)).toBe('object');
    expect(typeFilter(Object.create(null), type)).toBe('object');
    expect(typeFilter(null, type)).toBe('null');
    expect(typeFilter(new MyClass(), type)).toBe('class');
    expect(typeFilter(new Error(), type)).toBe('class');
  });
  it('default handler: typeClass', function () {
    expect(typeFilter(new MyClass(), typeClass)).toBe('MyClass');
    expect(typeFilter(1, typeClass)).toBe('number');
  });
  it('default handler: call', function () {
    expect(typeFilter(function () {
      return 1
    }, call)).toBe(1);
  });
  it('default handler: recheck', function () {
    var isNumberHandler = {
      function: [call, recheck],
      number: on,
      other: off
    };
    expect(typeFilter(1, isNumberHandler)).toBe(true);
    expect(typeFilter('1', isNumberHandler)).toBe(false);
    expect(typeFilter(function () {
      return 1
    }, isNumberHandler)).toBe(true);
    expect(typeFilter(function () {
      return '1'
    }, isNumberHandler)).toBe(false);
    expect(typeFilter(function () {
      return function () {
        return 1
      }
    }, isNumberHandler)).toBe(true);
  });
  it('default handler: error', function () {
    expect(function () {
      typeFilter(1, error('Error text'))
    }).toThrow('Error text');
    expect(function () {
      typeFilter(1, error('value: {value}, type: {type}, className: {className}'))
    }).toThrow('value: 1, type: number, className: ');
    expect(function () {
      typeFilter(1, error('field: {field}, fieldAsFunction: {fieldAsFunction}', {
        field: 'field value',
        fieldAsFunction: function () {
          return 'value of field'
        }
      }))
    }).toThrow('field: field value, fieldAsFunction: value of field');
  });
  it('default handler: handler', function () {
    let isNumber = typeFilter({
      number: on,
      other: off,
      function: [call, recheck]
    }, handler);
    expect(isNumber(1)).toBe(true);
    expect(isNumber('1')).toBe(false);
    expect(isNumber(function () {
      return 1
    })).toBe(true);
    expect(isNumber(function () {
      return '1'
    })).toBe(false);

    function getFilter (value) {
      return typeFilter(value, {
        array: handler,
        function: handler,
        object: handler,
        other: error('value has wrong type which equals {type}')
      });
    }
    isNumber = getFilter({
      number: on,
      other: off
    });
    expect(isNumber(1)).toBe(true);
    expect(isNumber('1')).toBe(false);
    expect(function () {
      getFilter(1)
    }).toThrow('value has wrong type which equals number');

    expect(typeFilter('1', typeFilter(() => ({
      string: [value => parseInt(value), recheck],
      function: [call, recheck],
      number: value => value + 1,
      other: yes
    }), {
      function: [call, recheck],
      object: handler,
      array: handler,
      other: () => () => {}
    }))).toBe(2);
  });
  it('custom options', function () {
    const deep = (value, options) => {
      const deep = options.deep || 0;
      options.deep = deep + 1;
      return value
    };
    let deepHandler = {
      function: [deep, call, recheck],
      other: (value, {deep}) => deep || 0
    };
    expect(typeFilter(1, deepHandler)).toBe(0);
    expect(typeFilter(() => 1, deepHandler)).toBe(1);
    expect(typeFilter(() => () => 1, deepHandler)).toBe(2);
    expect(typeFilter(() => () => 1, deepHandler, {deep: 1})).toBe(3);
  });
});