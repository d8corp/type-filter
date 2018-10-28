function getProperty (key, data, options, value) {
  if (key === 'value') return value;
  if (data.hasOwnProperty(key)) return data[key];
  if (options.hasOwnProperty(key)) return options[key];
  return '{' + key + '}'
}
module.exports = function error (text, data) {
  if (typeof data !== 'object') {
    data = {}
  }
  return function (value, options) {
    throw Error(text.replace(/{([a-zA-Z0-9]+)}/g, function (placeholder, placeholderId) {
      var field = getProperty(placeholderId, data, options, value);
      return typeof field === 'function' ? field(value, options) : field;
    }))
  }
};