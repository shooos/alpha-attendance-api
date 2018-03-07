const moment = require('moment');
const camel2snake = require('../../../system/camel2snake');

const UpsertQueryModel = function (model) {
  this._model = model;
  this._tableName = model.name;
  this._columns = Object.keys(model.columns).map((name) => camel2snake(name));
  this._values = {};
  this._updateValues = {};
  this._updates = [];
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
      this._updateValues = authUser;
      this._updates.push(column + '=' + key);
      break;
    case 'update_date':
      this._updateValues = moment().utc();
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
  query.push('ON CONFLICT ON CONSTRAINT');
  query.push('UPDATE SET ' + this._updates.join(', '));
  query.push('RETURNING *');

  const values = Object.assign(this._values, this._updateValues);
  return {
    text: query.join(' '),
    values: Object.keys(values)
      .sort((a, b) => {
        return (a.substr(1) + 0) > (b.substr(1) + 0);
      })
      .map((key) => values[key]),
  };
}

UpsertQueryModel.prototype.formatResult$ = function (rows) {
  // DO NOTHING
}

module.exports = UpsertQueryModel;