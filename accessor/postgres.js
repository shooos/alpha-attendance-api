const pg = require('pg');
const logger = require('../system/logger');

const Postgres = function() {
  const config = require('../config/postgres-config.json');
  this._pool = new pg.Pool(config);
}

Postgres.prototype._executeQuery = async function(queries) {
  if (!queries || !queries.length) return;

  const client = await this._pool.connect().catch((err) => {
    logger.error.error(err);
    throw new Error('Connection Failed');
  });
  let results = [];

  try {
    await client.query('BEGIN');

    try {
      for (let query of queries) {
        if (query.text && query.values) {
          logger.system.info('Execute query: ', query.text + ' Params: [ ' + query.values.join(', ') + ' ]');
        } else {
          logger.system.info('Execute query: ', query);
        }

        const result = await client.query(query);
        results.push(result.rows);
        logger.system.info(result);
      }
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
    await client.query('COMMIT');
  } finally {
    await client.release();
  }

  return results;
};

Postgres.prototype.initialize = async function() {
  const models = [];
  models.push(require('./model/member'));
  models.push(require('./model/work-pattern'));
  models.push(require('./model/working-hours'));
  models.push(require('./model/actual-time'));
  models.push(require('./model/actual-time-detail'));
  models.push(require('./model/estimate-time'));
  models.push(require('./model/estimate-unclaimed-time'));

  for (let model of models.concat([])) {
    const isExists = await this.isExistsTables(model.name);
    if (isExists) {
      models.splice(models.indexOf(model), 1);
    }
  }

  if (models.length) {
    const initializer = require('./sql/postgres/initialize');
    await this._executeQuery(initializer(models));
  }
};

Postgres.prototype.isExistsTables = async function(tablename) {
  const query = {
    text: 'SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename=$1);',
    values: [tablename],
    rowMode: 'array',
  };

  const results = await this._executeQuery([query]);
  return results[0][0][0];
};

Postgres.prototype.execute = async function(queryModels) {
  if (queryModels == null) return;

  const queries = Array.isArray(queryModels) ? queryModels.map((queryModel) => queryModel.getQuery()) : [queryModels.getQuery()];
  const queryResults = await this._executeQuery(queries).catch((err) => {
    logger.error.error(err);
    throw err;
  });

  if (Array.isArray(queryModels)) {
    const results = [];
    for (let i = 0, length = queryResults.length; i < length; i++) {
      results.push(queryModels[i].formatResult$(queryResults[i]));
    }
    return results;
  } else {
    return queryModels.formatResult$(queryResults[0]);
  }
};

module.exports = Postgres;
