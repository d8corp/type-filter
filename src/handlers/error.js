module.exports = function error (text, data) {
  if (typeof data !== 'object') {
    data = {}
  }
  return function (value, options) {
    data.value = value;
    data.type = options.type;
    data.className = options.className;
    throw Error(text.replace(/{([a-zA-Z0-9]+)}/g, function (placeholder, placeholderId) {
      var field = data[placeholderId];
      return typeof field === 'function' ? field(value, options.type, options.className) : data.hasOwnProperty(placeholderId) ? field : placeholder;
    }))
  }
};