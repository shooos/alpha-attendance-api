const logger = require('../../../system/logger');

const SelectQueryModel = function (model) {
  this._model = model;
  this._tableName = model.name;
  this._columns = Object.keys(model.columns);
  this._conditions = [];
  this._values = {};
}

SelectQueryModel.prototype.addAndCondition = function (condition) {
  const key = '$' + (Object.keys(this._values).length + 1);
  this._values[key] = condition.value;

  this._conditions.push({
    operator: 'AND',
    expression: condition.key + '=' + key,
  });
}

SelectQueryModel.prototype.addOrCondition = function (condition) {
  const key = '$' + (Object.keys(this._values).length + 1);
  this._values[key] = condition.value;

  this._conditions.push({
    operator: 'OR',
    condition: condition.key + '=' + key,
  });
}

SelectQueryModel.prototype.getQuery = function () {
  let condition;
  for (let cond of this._conditions) {
    if (!condition) {
      condition = cond.expression;
    } else {
      condition += (' ' + cond.operator + ' ' + cond.expression);
    }
  }

  return {
    text: 'SELECT ' + this._columns.join(', ') + ' FROM ' + this._model.name + ' WHERE ' + condition,
    values: Object.keys(this._values).map((key) => this._values[key]),
  };
}

module.exports = SelectQueryModel;
