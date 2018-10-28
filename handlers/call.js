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
