module.exports = function error (text, data) {
  if (typeof data !== 'object') {
    data = {}
  }
  return function (value, type, className) {
    data.value = value;
    data.type = type;
    data.className = className;
    throw Error(text.replace(/{([a-zA-Z0-9]+)}/g, function (placeholder, placeholderId) {
      var field = data[placeholderId];
      return typeof field === 'function' ? field(value, type, className) : data.hasOwnProperty(placeholderId) ? field : placeholder;
    }))
  }
};