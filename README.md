# type-filter
`typeFilter(value[, handler | handlerList | typeHandler ])`
 - `value` is any type
 - `handler` is a function
 - `handlerList` is an array of functions
 - `typeHandler` is an object of functions
## install
`npm i type-filter`
## import
```javascript
import typeFilter, { yes } from 'type-filter'
```
or
```javascript
import { typeFilter, yes } from 'type-filter'
```
`yes` is a handler (see below)
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
Any handler gets 3 arguments: `value`, `type` and `className`.

`value` equals the first argument of `typeFilter`.
```javascript
const handler = value => value + 1
typeFilter(1, handler) // returns 2
```
`type` equals what `typeFilter` returns for current `value` (*see get type*)
```javascript
const type = (value, type) => value + ': ' + type
typeFilter(1, type) // returns '1: number'
typeFilter('1', type) // returns '1: string'
```
`className` equals empty string for all types except for `class`.  
If the `type` equals `class` then `className` contains name of class.
```javascript
const classType = (value, type, className) => {
  return value + ': ' + type + (className && '(' + className + ')')
}
typeFilter(1, classType) // returns '1: number'
typeFilter({}, classType) // returns '[object Object]: object'
typeFilter(new Map(), classType) // returns '[object Object]: class(Map)'
typeFilter(new class MyClass {}, classType) // returns '[object Object]: class(MyClass)'
```

## handlerList
##### If the second argument of `typeFilter` is an array then this argument is handlerList.
`handlerList` can contain `handler`, `handlerList` or `typeHandler`.

```javascript
const square = value => value * value
const addOne = value => value + 1
typeFilter(1, [addOne, square]) // returns 4
typeFilter(2, [square, addOne]) // returns 5
typeFilter(1, [addOne, [square, square]]) // returns 16
```

## typeHandler
##### If the second argument of `typeFilter` is an object then this argument is typeHandler.
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
  custom: (value, type, className) => `value: ${value}, type: ${type}, className: ${className}`
})) // runs throw Error('value: 1, type: number, className: ')
```