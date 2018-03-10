const moment = require('moment');

const camel2snake = require('../../../system/camel2snake');
const snake2camel = require('../../../system/snake2camel');

const SelectQueryModel = function (model) {
  this._model = model;
  this._tableName = model.name;
  this._columns = Object.keys(model.columns).map((name) => camel2snake(name));
  this._conditions = [];
  this._values = {};
  this._joins = [];
}

SelectQueryModel.prototype.addCondition = function (operator, name, value, not) {
  const key = '$' + (Object.keys(this._values).length + 1);
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

SelectQueryModel.prototype.naturalLeftOuterJoin = function (innerTableModel) {
  this._naturalJoin('NATURAL LEFT OUTER JOIN', innerTableModel);
}

SelectQueryModel.prototype.naturalInnerJoin = function (innerTableModel) {
  this._naturalJoin('NATURAL INNER JOIN', innerTableModel);
}

SelectQueryModel.prototype._naturalJoin = function (joinRule, innerTableModel) {
  this._joins.push([joinRule, innerTableModel.name].join(' '));
}

SelectQueryModel.prototype.getQuery = function () {
  const query = [];
  query.push('SELECT');
  query.push(this._columns.join(', '));
  query.push('FROM');
  query.push(this._model.name);
  if (this._conditions.length) {
    let condition = '';
    for (let cond of this._conditions) {
      if (!condition) {
        condition = cond.expression;
      } else {
        condition += (' ' + cond.operator + ' ' + cond.expression);
      }
    }
    query.push('WHERE');
    query.push(condition);
  }

  return {
    text: query.join(' '),
    values: Object.keys(this._values).map((key) => this._values[key]),
  };
}

SelectQueryModel.prototype.formatResult$ = require('./result-formatter');

module.exports = SelectQueryModel;
