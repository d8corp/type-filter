# type-filter (3.1.3)
`typeFilter([ value ] [, handler | handlerList | typeHandler ] [, options ])`
 - `value` is any type
 - `handler` is a function
 - `handlerList` is an array
 - `typeHandler` is an object
 - `options` is boolean or function or object
 
[npm](https://www.npmjs.com/package/type-filter) |
[github](https://github.com/d8corp/type-filter)
## install
`npm i type-filter`
## import
```javascript
import typeFilter, { handler } from 'type-filter'
```
or
```javascript
import { typeFilter, handler } from 'type-filter'
```
## get type
Use only one argument to get a type.
```javascript
typeFilter(undefined) // returns 'undefined'
typeFilter(null) // returns 'null'
typeFilter(NaN) // returns 'nan'
typeFilter(1) // returns 'number'
typeFilter('1') // returns 'string'
typeFilter(false) // returns 'boolean'
typeFilter(Symbol()) // returns 'symbol'
typeFilter(() => {}) // returns 'function'
typeFilter([]) // returns 'array'
typeFilter({}) // returns 'object'
typeFilter(Object.create(null)) // returns 'object'
typeFilter(new class {}) // returns 'class'
typeFilter(new Map()) // returns 'class'
typeFilter() // returns 'undefined'
```

## handler
##### If the second argument of `typeFilter` is a function then it will be used as a `handler`.   
Any handler gets 2 arguments: `value` and `options`.

`value` equals the first argument of `typeFilter`.
```javascript
const handler = value => value + 1
typeFilter(1, handler) // returns 2
```
`options.type` equals what `typeFilter` returns for current `value` (*see get type*)
```javascript
const type = (value, {type}) => value + ': ' + type
typeFilter(1, type) // returns '1: number'
typeFilter('1', type) // returns '1: string'
```
`options.className` equals empty string for all types except for `class`.  
If the `type` equals `class` then `options.className` contains name of class.
```javascript
const classType = (value, {type, className}) => {
  return value + ': ' + type + (className && '(' + className + ')')
}
typeFilter(1, classType) // returns '1: number'
typeFilter({}, classType) // returns '[object Object]: object'
typeFilter(new Map(), classType) // returns '[object Object]: class(Map)'
typeFilter(new class MyClass {}, classType) // returns '[object Object]: class(MyClass)'
```

## handlerList
##### If the second argument of `typeFilter` is an array then this argument is `handlerList`.
`handlerList` can contain `handler`, `handlerList` or `typeHandler`.

```javascript
const square = value => value * value
const addOne = value => value + 1
typeFilter(1, [addOne, square]) // returns 4
typeFilter(2, [square, addOne]) // returns 5
typeFilter(1, [addOne, [square, square]]) // returns 16
```

## typeHandler
##### If the second argument of `typeFilter` is an object then this argument is `typeHandler`.
keys of `typeHandler` equals type or class name of value.  
values of `typeHandler` can contain `handler`, `handlerList` or `typeHandler`.  
if a `typeHandler` does not contain key which equals current value type or class name
then `typeFilter` returns this value.

```javascript
const noNumber = {
  number: () => {}
}
typeFilter(1, noNumber) // returns undefined
typeFilter('2', noNumber) // returns '2'
```
```javascript
const noMap = {
  Map: () => {}
}
typeFilter(new Map(), noMap) // returns undefined
typeFilter(new Set(), noMap) // returns instance of Set
```

## other in typeHandler
you may use other key of `typeHandler` to handle other types
```javascript
const onlyNumber = {
  number: value => value,
  other: () => {}
}
typeFilter(1, onlyNumber) // returns 1
typeFilter('2', onlyNumber) // returns undefined
```
## once
*`handler` and `typeHandler` run only one handle but `handlerList` runs
each handler inside it and
each handler gets value which equals result of previous handler.
to have result of the first handler in `handlerList`
which returns needed result you may use `once`.*
  
if the third argument (or `once` key of the third argument) equals `true` or `function`
then each handler gets original value.  

if the third argument (or `once` key of the third argument)
equals `true` the typeFilter returns a result of the first handler
which returns some equals `true` (`1`, `true`, `{}`, `[]`, ...).
```javascript
typeFilter(1, [no, off, type, yes])
// 1 > [no] > undefined > [off] > false > [type] > 'boolean' > [yes] > 'boolean'
typeFilter(1, [no, off, type, yes], true)
// 1 > [no] > undefined
// 1 > [off] > false
// 1 > [type] > 'number'
typeFilter(1, [no, off, yes, type], true)
// 1 > [no] > undefined
// 1 > [off] > false
// 1 > [yes] > 1
``` 
if the third argument (or `once` key of the third argument)
equals `function` the `function` gets result of handlerList's handler call
and the typeFilter returns a result which pass the `function` test. to pass the test the `function`
should returns some equals `true` (`1`, `true`, `{}`, `[]`, ...).
```javascript
const addOne = value => value + 1
const addTwo = value => value + 2
const addThree = value => value + 3

typeFilter(1, [addOne, addTwo, addThree], value => value > 2)
// returns 3 (the result of addTwo)
// addOne and addTwo are called
```
if all handlers fail the test then typeFilter returns `undefined`
```javascript
typeFilter(1, [yes, on, off], () => false) // returns undefined
```
`handlerListType` works only for `handlerList`
```javascript
typeFilter(0, yes, true) // returns 0
typeFilter(0, [yes], true) // returns undefined
```
## options
you may use the third argument as options which can contain
`type`, `classType`, `once`, `rootHandler` like the second argument of handler.  
each handler get the same `options` object and you can share variables between handlers
```javascript
const deep = (value, options) => {
  const deep = options.deep || 0
  options.deep = deep + 1
  return value
}
const deepHandler = {
  function: [deep, call, recheck],
  other: (value, {deep}) => deep || 0
}
typeFilter(1, deepHandler) // returns 0
typeFilter(() => 1, deepHandler) // returns 1
typeFilter(() => () => 1, deepHandler) // returns 2
typeFilter(() => () => 1, deepHandler, {deep: 1}) // returns 3
``` 

## default handlers
you may use default handlers from this library

#### no
always returns `undefined`
```javascript
const noNumber = {
  number: no
}
typeFilter(1, noNumber) // returns undefined
typeFilter('2', noNumber) // returns '2'
```

#### yes
always returns value
```javascript
const onlyNumber = {
  number: yes,
  other: no
}
typeFilter(1, onlyNumber) // returns 1
typeFilter('2', onlyNumber) // returns undefined
```

#### on, off
`on` always returns true  
`off` always returns false
```javascript
const isNumber = {
  number: on,
  other: off
}
typeFilter(1, isNumber) // returns true
typeFilter('2', isNumber) // returns false
```

#### type
`type` always returns type of value
```javascript
typeFilter('2', type) // returns 'string'
```

#### typeClass
`typeClass` returns type of value or className for type equals `class`
```javascript
typeFilter(new Map(), typeClass) // returns 'Map'
typeFilter({}, typeClass) // returns 'object'
```

#### call
`call` always returns result of value call 
```javascript
typeFilter(() => 1, call) // returns 1
```

#### recheck
`recheck` is rechecking value like this type filter gets value of handler
```javascript
const isNumberHandler = {
  function: [call, recheck],
  number: () => 'this is number',
  other: () => 'this is not number'
}
typeFilter(1, isNumberHandler) // returns 'this is number'
typeFilter('1', isNumberHandler) // returns 'this is not number'
typeFilter(() => 1, isNumberHandler) // returns 'this is number'
typeFilter(() => '1', isNumberHandler) // returns 'this is not number'
typeFilter(() => () => 1, isNumberHandler) // returns 'this is number'
```
be careful, `recheck` can create an infinite loop
```javascript
typeFilter(1, recheck)
```

#### error
`error` runs exception
```javascript
typeFilter(1, error('Text')) // runs throw Error('Text')
```
you may use one of default variable (`value`, `type`, `className`) inside text of `error`'s argument
```javascript
// runs throw Error('value: 1, type: number, className: ')
typeFilter(1, error('value: {value}, type: {type}, className: {className}'))
```
also you may use own properties
```javascript
typeFilter(1, error('error: {custom}', {
  custom: 'custom value'
})) // 'error: custom value'
```
if the custom value is a function it will be runs
```javascript
typeFilter(1, error('error: {custom}', {
  custom: () => 'custom value'
})) // 'error: custom value'
```
this custom property gets `value`, `type`, `className` as a handler
```javascript
typeFilter(1, error('error: {custom}', {
  custom: (value, {type, className}) => `value: ${value}, type: ${type}, className: ${className}`
})) // runs throw Error('error: value: 1, type: number, className: ')
```

#### handler
`handler` like bind method for a function but you may set up `handler` as default and use `value` later
```javascript
const isNumber = typeFilter({
  number: on,
  other: off
}, handler)
isNumber(1) // returns true
isNumber('1') // returns false
```
you may use the `handler` anywhere like other handlers
```javascript
const getFilter = value => typeFilter(value, {
  array: handler,
  function: handler,
  object: handler,
  other: error('handler has wrong type which equals {type}')
})
const isNumber = getFilter({
  number: on,
  other: off
})
isNumber(1) // true
isNumber('1') // false
getFilter(1) // error: handler has wrong type which equals number
```
change list
-
#### 3.1.0
now all options in handlers are the same object which you pass to the third argument of `typeFilter`
#### 3.0.0
now the second argument of any handler is object which contains
`type`, `className`, `handler`, `once`, `rootHandler`