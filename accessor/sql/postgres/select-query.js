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
  this._join('NATURAL LEFT OUTER JOIN', innerTableModel);
}

SelectQueryModel.prototype.naturalInnerJoin = function (innerTableModel) {
  this._join('NATURAL INNER JOIN', outerTableModel, innerTableModel);
}

SelectQueryModel.prototype._naturalJoin = function (joinRule, innerTableModel) {
  this._joins.push([joinRule, innerTableModel.name].join(' '));
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

SelectQueryModel.prototype.formatResult$ = function (rows) {
  for (let row of rows) {
    for (let columnName of Object.keys(row)) {
      if (row[columnName] == null) break;

      const type = this._model.columns[snake2camel(columnName)].type;
      switch (type) {
      case 'date':
        row[columnName] = moment(row[columnName]).format('YYYY-MM-DD');
        break;
      case 'datetime':
        row[columnName] = moment(row[columnName]);
      default:
        // DO NOTHING
      }
    }
  }
}

module.exports = SelectQueryModel;
