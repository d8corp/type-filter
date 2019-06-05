var call = require('./call');
var recheck = require('./recheck');
var callRecheck = [call, recheck];
callRecheck.args = function () {
  return [call.args.apply(this, arguments), recheck];
};

module.exports = callRecheck;