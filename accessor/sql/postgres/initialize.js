const camel2snake = require('../../../system/camel2snake');

const createQuery = (model) => {
  let columns = [];
  let primaryKeys = [];
  let unique = {};

  Object.keys(model.columns).forEach((name) => {
    const column = model.columns[name];
    const columnName = camel2snake(name);
    const type = resolveType(column);
    const definition = [columnName, type];

    if (column.notNull) definition.push('NOT NULL');
    if (column.reference) definition.push('REFERENCES ' + column.reference.table + '(' + column.reference.column + ') ON DELETE CASCADE');
    columns.push(definition.join(' '));

    if (column.key) primaryKeys.push(columnName);
    if (column.unique === true) {
      Array.isArray(unique['__unique']) ? unique[true].push(columnName) : (unique['__unique'] = [columnName]);
    } else if (column.unique != null) {
      Array.isArray(unique[column.unique]) ? unique[column.unique].push(columnName) : (unique[column.unique] = [columnName]);
    }
  });

  const constraints = [];
  for (let key of Object.keys(unique)) {
    if (key === '__unique') {
      for (let q of unique[key]) constraints.push('UNIQUE (' + q + ')');
    } else {
      constraints.push('CONSTRAINT ' + model.name + '_' + key + ' UNIQUE (' + unique[key].join(', ') + ')');
    }
  }

  let createQuery = 'CREATE TABLE ' + model.name + ' (' + columns.join(', ');
  if (primaryKeys.length) createQuery += (', PRIMARY KEY(' + primaryKeys.join(', ') + ')');
  if (constraints.length) createQuery += (', ' + constraints.join(', '));
  createQuery += ');';

  return createQuery;
}

const resolveType = (column) => {
  switch(column.type) {
  case 'string':
    return 'VARCHAR(' + column.length + ')';
  case 'boolean':
    return 'BOOL';
  case 'date':
    return 'DATE';
  case 'time':
    return 'VARCHAR(5)';
  case 'hours':
    return 'INTERVAL HOUR TO MINUTE';
  case 'datetime':
    return 'TIMESTAMP WITH TIME ZONE';
  }
}

module.exports = function(models) {
  const queries = [];
  models.forEach((model) => {
    queries.push(createQuery(model));
  });

  return queries;
};
