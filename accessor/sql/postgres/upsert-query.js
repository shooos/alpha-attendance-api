const moment = require('moment');
const camel2snake = require('../../../system/camel2snake');

const UpsertQueryModel = function (model) {
  this._model = model;
  this._tableName = model.name;
  this._columns = Object.keys(model.columns).map((name) => camel2snake(name));
  this._values = {};
  this._updates = [];
  this._uniqueColumns = Object.keys(model.columns)
    .filter((name) => (model.columns[name].key || !!model.columns[name].unique))
    .map((name) => camel2snake(name));
}

UpsertQueryModel.prototype.setValues = function (values, authUser) {
  for (let column of this._columns) {
    const key = '$' + (Object.keys(this._values).length + 1);

    switch (column) {
    case 'create_user':
      this._values[key] = authUser;
      break;
    case 'create_date':
      this._values[key] = moment().utc();
      break;
    case 'update_user':
      this._values[key] = authUser;
      this._updates.push(column + '=' + key);
      break;
    case 'update_date':
      this._values[key] = moment().utc();
      this._updates.push(column + '=' + key);
      break;
    default:
      const value = values[column] != null ? values[column] : null;
      this._values[key] = value;
      this._updates.push(column + '=' + key);
    }
  }
}

UpsertQueryModel.prototype.getQuery = function () {
  const query = [];
  query.push('INSERT INTO ' + this._tableName);
  query.push('(' + this._columns.join(', ') + ')');
  query.push('VALUES (' + Object.keys(this._values).join(', ') + ')');
  query.push('ON CONFLICT (' + this._uniqueColumns.join(', ') + ') DO UPDATE');
  query.push('SET ' + this._updates.join(', '));
  query.push('RETURNING *');

  const values = Object.keys(this._values)
    .sort((a, b) => a.substr(1) - b.substr(1))
    .map((key) => this._values[key]);

  return {
    text: query.join(' '),
    values: values,
  };
}

UpsertQueryModel.prototype.formatResult$ = require('./result-formatter');

module.exports = UpsertQueryModel;