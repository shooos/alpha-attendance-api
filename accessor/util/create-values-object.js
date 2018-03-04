const camel2snake = require('../../system/camel2snake');

module.exports = function(model, body) {
  const values = {};
  for (let column of Object.keys(model.columns)) {
    if (body[column] != null) {
      values[camel2snake(column)] = body[column];
    }
  }

  return values;
}