console.warn('importing by "type-filter/src/handlers/call" is deprecated, please use "type-filter/handlers/call" for that');
function call (func) {
  return func()
}
call.args = function () {
  var args = arguments;
  return function (func) {
    return func.apply(this, args)
  };
};

module.exports = call;
