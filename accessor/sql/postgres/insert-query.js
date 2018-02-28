const camel2snake = require('../../../system/camel2snake');

const InsertQueryModel = function (model) {
  this._model = model;
  this._tableName = model.name;
  this._columns = Object.keys(model.columns).map((name) => camel2snake(name));
  this._values = {};
}

InsertQueryModel.prototype.appendValues = function (values) {
  for (let column of this._columns) {
    const value = values[column] != null ? values[column] : null;
    this._values['$' + (Object.keys(this._values).length + 1)] = value;
  }
}

InsertQueryModel.prototype.getQuery = function () {
  return {
    text: 'INSERT INTO ' + this._tableName + ' (' + this._columns.join(', ') + ') VALUES (' + Object.keys(this._values).join(', ') + ');',
    values: Object.keys(this._values).map((key) => this._values[key]),
  };
}

module.exports = InsertQueryModel;