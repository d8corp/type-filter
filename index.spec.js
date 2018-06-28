/* global it, describe, expect, jest */
var typeFilter = require('./index');
var yes = typeFilter.yes,
    no = typeFilter.no,
    on = typeFilter.on,
    off = typeFilter.off,
    call = typeFilter.call,
    type = typeFilter.type,
    typeClass = typeFilter.typeClass;

function MyClass () {}

describe('typeFilter', function () {
  it('get type', function () {
    // use only one argument to get its type
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
    // if the second argument is handler then the handler is always used on first argument
    function addOne (value) {
      return value + 1
    }
    expect(typeFilter(1, addOne)).toBe(2);
    // a handler gets 3 arguments: value, type and className
    function getType (value, type) {
      return value + ': ' + type
    }
    expect(typeFilter(1, getType)).toBe('1: number');
    // 3th argument is className and returns empty string for all types except for class
    function getTypeOrClassName (value, type, className) {
      return value + ': ' + type + (className ? '(' + className + ')' : className)
    }
    expect(typeFilter({}, getTypeOrClassName)).toBe('[object Object]: object');
    expect(typeFilter(new MyClass(), getTypeOrClassName)).toBe('[object Object]: class(MyClass)');
    const CustomClass = function () {};
    const MyCustomClass = CustomClass;
    expect(typeFilter(new MyCustomClass(), getTypeOrClassName)).toBe('[object Object]: class(CustomClass)');
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
  it('default handlers', () => {
    // yes always returns the first argument of typeFilter
    expect(typeFilter(1, yes)).toBe(1);
    // no always returns undefined
    expect(typeFilter(1, no)).toBe(undefined);
    // on always returns true
    expect(typeFilter(1, on)).toBe(true);
    // off always returns false
    expect(typeFilter(1, off)).toBe(false);
    // type always returns type of value
    expect(typeFilter(1, type)).toBe('number');
    expect(typeFilter(new MyClass(), type)).toBe('class');
    // typeClass returns type of value for all types except for class, this case it returns class name
    expect(typeFilter(1, typeClass)).toBe('number');
    expect(typeFilter(new MyClass(), typeClass)).toBe('MyClass');
    // call returns the function result
    expect(typeFilter(function () {return 1}, call)).toBe(1);
    // you may use combine to have some handlers
    function addOne (value) {return value + 1}
    expect(typeFilter(function () {return 2}, [call, addOne])).toBe(3);
    // combine unfolds all array arguments
    expect(typeFilter(function () {return 3}, [call, [addOne]])).toBe(4);
  });
  it('type filtering', () => {
    const numberBlock = {
      number: no // all types pass except for number
    };
    expect(typeFilter(1, numberBlock)).toBe(undefined);
    expect(typeFilter('1', numberBlock)).toBe('1');
    expect(typeFilter(null, numberBlock)).toBe(null);
  });
  it('other', () => {
    const options = {
      number: yes,
      other: no
    };
    expect(typeFilter(1, options)).toBe(1);
    expect(typeFilter('1', options)).toBe(undefined);
    expect(typeFilter(null, options)).toBe(undefined);
  });
  it('class name filter', () => {
    const onlyMap = {
      Map: yes,
      other: no
    };
    expect(typeFilter(new Map(), onlyMap)).toEqual(new Map());
    expect(typeFilter(new Set(), onlyMap)).toBe(undefined);
  });
  it('actions', () => {
    // you may use handlers like actions to do something for some type
    const call = jest.fn();
    const options = {
      string: value => call(value)
    };
    expect(call.mock.calls.length).toBe(0);
    typeFilter(1, options);
    expect(call.mock.calls.length).toBe(0);
    typeFilter('1', options);
    expect(call.mock.calls.length).toBe(1);
    expect(call.mock.calls[0][0]).toBe('1');
  });
});