const {Client} = require('pg');
const logger = require('../system/logger');

const Postgres = function(config) {
  this._client = new Client(config);
}

Postgres.prototype.connect = async function() {
  await this._client.connect();
};

Postgres.prototype.executeQuery = async function(query) {
  logger.system.info(query.text + ' [ ' + query.values.join(', ') + ' ]');

  const result = await this._client.query(query);
  return result;
};

Postgres.prototype.initialize = async function() {
  const initializer = require('./sql/initialize-postgres');

  const models = [];
  models.push(require('./model/user'));
  models.push(require('./model/work-pattern'));
  models.push(require('./model/working-hours'));
  models.push(require('./model/actual-time'));
  models.push(require('./model/actual-time-detail'));
  models.push(require('./model/estimate-time'));
  models.push(require('./model/estimate-unclaimed-time'));

  models.concat([]).forEach(async (model, index) => {
    if (!await this.isExistsTables(model.name)) models.splice(index, 1);
  });

  const queries = initializer(models);
};

Postgres.prototype.isExistsTables = async function(tablename) {
  const query = {
    text: 'SELECT EXISTS (SELECT 1 FROM pg_tables WHERE tablename=$1);',
    values: [tablename],
    rowMode: 'array',
  };

  const result = await this.executeQuery(query);
  return result.rows[0][0];
};

Postgres.prototype.insert = async function(model, values) {
  if (model == null || values == null) return;


};

Postgres.prototype.update = async function(model, values, condition) {
  if (model == null || values == null) return;

};

Postgres.prototype.select = async function(model, condition) {
  if (model == null) return;

};

module.exports = Postgres;
