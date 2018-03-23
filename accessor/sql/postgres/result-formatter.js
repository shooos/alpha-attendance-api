const moment = require('moment');
const snake2camel = require('../../../system/snake2camel');

module.exports = function (rows) {
  const results = [];

  for (let row of rows) {
    const result = {};

    for (let columnName of Object.keys(row)) {
      const key = snake2camel(columnName);
      if (row[columnName] == null) {
        result[key] = null;
        continue;
      }

      const type = this._model.columns[key].type;
      switch (type) {
      case 'date':
        result[key] = moment(row[columnName]).format('YYYY-MM-DD');
        break;
      case 'datetime':
        result[key] = moment(row[columnName]);
        break;
      case 'hours':
        result[key] = moment.utc(moment.duration(row[columnName]).asMilliseconds()).format('HH:mm');
        break;
      default:
        result[key] = row[columnName];
      }
    }
    results.push(result);
  }

  return results;
}