const moment = require('moment');

const camel2snake = require('../../../system/camel2snake');
const snake2camel = require('../../../system/snake2camel');

const SelectQueryModel = function (model) {
  this._model = model;
  this._tableName = model.name;
  this._columns = Object.keys(model.columns).map((name) => camel2snake(name));
  this._conditions = [];
  this._values = {};
  this._orderBy = [];
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

SelectQueryModel.prototype.addOrderBy = function (column, order) {
  this._orderBy.push([column, order].join(' '));
}

SelectQueryModel.prototype.getQuery = function () {
  const query = [];
  query.push('SELECT');
  query.push(this._columns.map((column) => this._model.name + '.' + column).join(', '));
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
  if (this._orderBy.length) {
    query.push('ORDER BY');
    query.push(this._orderBy.join(', '));
  }

  return {
    text: query.join(' '),
    values: Object.keys(this._values).map((key) => this._values[key]),
  };
}

SelectQueryModel.prototype.formatResult$ = require('./result-formatter');

module.exports = SelectQueryModel;
