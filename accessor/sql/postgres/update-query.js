const moment = require('moment');
const camel2snake = require('../../../system/camel2snake');

const UpdateQueryModel = function (model) {
  this._model = model;
  this._tableName = model.name;
  this._columns = Object.keys(model.columns).map((name) => camel2snake(name));
  this._updates = [];
  this._conditions = [];
  this._values = {};
}

UpdateQueryModel.prototype.setUpdateValues = function (values, authUser) {
  // 更新ユーザ
  if (this._columns.indexOf('update_user') !== -1 && authUser) {
    const key = this.generateValueKey();
    this._values[key] = authUser;
    this._updates.push('update_user = ' + key);
  }
  // 更新日時
  if (this._columns.indexOf('update_date') !== -1) {
    const key = this.generateValueKey();
    this._values[key] = moment().utc();
    this._updates.push('update_date = ' + key);
  }

  Object.keys(values).forEach((name) => {
    const key = this.generateValueKey();
    this._values[key] = values[name];
    this._updates.push(name + '=' + key);
  });
}

UpdateQueryModel.prototype.addCondition = function (operator, name, value, not) {
  const key = this.generateValueKey();
  if (value != null) {
    this._values[key] = value;
  }

  const comparison = value != null ? (not ? ' != ' : ' = ') : (not ? ' IS NOT ' : ' IS ');
  const val = value != null ? key : 'NULL';

  this._conditions.push({
    operator: operator,
    expression: name + comparison + val,
  });
}

UpdateQueryModel.prototype.getQuery = function () {
  let condition;
  for (let cond of this._conditions) {
    if (!condition) {
      condition = cond.expression;
    } else {
      condition += (' ' + cond.operator + ' ' + cond.expression);
    }
  }

  return {
    text: 'UPDATE ' + this._model.name + ' SET ' + this._updates.join(', ') + ' WHERE ' + condition + '  RETURNING *;',
    values: Object.keys(this._values).map((key) => this._values[key]),
  };
}

UpdateQueryModel.prototype.generateValueKey = function () {
  return '$' + (Object.keys(this._values).length + 1);
}

UpdateQueryModel.prototype.formatResult$ = function (rows) {
  // DO NOTHING
}

module.exports = UpdateQueryModel;
