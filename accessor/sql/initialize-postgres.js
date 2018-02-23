const createQuery = (model) => {
  let columns = [];
  let primaryKeys = [];

  Object.keys(model.columns).forEach((name) => {
    const column = model.columns[name];
    const columnName = name.replace(/[A-Z]/g, upperToUnderscoreLower);
    const type = resolveType(column);
    const definition = [columnName, type];

    if (column.notNull) definition.push('NOT NULL');
    columns.push(definition.join(' '));

    if (column.key) primaryKeys.push(columnName);
  });

  return 'CREATE TABLE ' + model.name + ' (' + columns.join(', ') + ', ' + 'PRIMARY KEY(' + primaryKeys.join(', ') + '));'
}

const resolveType = (column) => {
  switch(column.type) {
  case 'string':
    return 'VERCHAR(' + column.length || 10 + ')';
  case 'boolean':
    return 'BOOL';
  case 'date':
    return 'DATE';
  case 'time':
    return 'TIME WITHOUT TIME ZONE';
  case 'hours':
    return 'INTERVAL HOUR TO MINUTE';
  case 'datetime':
    return 'TIMESTAMP WITHOUT TIME ZONE';
  }
}

const upperToUnderscoreLower = (match) => {
  return '_' + match.toLowerCase();
}

module.exports = function(models) {
  const queries = [];
  models.forEach((model) => {
    queries.push(createQuery(model));
  });

  return queries;
};
