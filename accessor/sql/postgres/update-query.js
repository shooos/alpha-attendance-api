const logger = require('../../../system/logger');

const UpdateQueryModel = function (model) {
  this._model = model;
  this._tableName = model.name;
  this._columns = Object.keys(model.columns);
  this._updates = [];
  this._conditions = [];
  this._values = {};
}

UpdateQueryModel.prototype.setUpdateValues = function (values) {
  Object.keys(values).forEach((name) => {
    const key = '$' + (Object.keys(this._values).length + 1);
    this._values[key] = values[name];
    this._updates.push(name + '=' + key);
  });
}

UpdateQueryModel.prototype.addAndCondition = function (condition) {
  const key = '$' + (Object.keys(this._values).length + 1);
  this._values[key] = condition.value;

  this._conditions.push({
    operator: 'AND',
    expression: condition.key + '=' + key,
  });
}

UpdateQueryModel.prototype.addOrCondition = function (condition) {
  const key = '$' + (Object.keys(this._values).length + 1);
  this._values[key] = condition.value;

  this._conditions.push({
    operator: 'OR',
    condition: condition.key + '=' + key,
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
    text: 'UPDATE ' + this._model.name + ' SET ' + this._updates.join(', ') + ' WHERE ' + condition,
    values: Object.keys(this._values).map((key) => this._values[key]),
  };
}

module.exports = UpdateQueryModel;
