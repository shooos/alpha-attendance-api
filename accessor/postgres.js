const {Client} = require('pg');

const Postgres = function(config) {
  this._client = new Client(config);
  this._connect();
}

Postgres.prototype._connect = async function() {
  await this._client.connect();
};

Postgres.prototype.insert = function(model, values) {
  if (model == null || values == null) return;


};

Postgres.prototype.update = function(model, values, condition) {
  if (model == null || values == null) return;

};

Postgres.prototype.select = function(model, condition) {
  if (model == null) return;

};

module.exports = Postgres;
