const memberModel = require('../accessor/model/member');
const uniqid = require('uniqid');
const logger = require('../system/logger');

/* Queries */
const SelectQuery = require('../accessor/sql/postgres/select-query');
const UpdateQuery = require('../accessor/sql/postgres/update-query');
const InsertQuery = require('../accessor/sql/postgres/insert-query');

const Authenticator = function (accessor) {
  this._accessor = accessor;
}

Authenticator.prototype.register = async function (id, password, admin) {
  const selectQuery = new SelectQuery(memberModel);
  selectQuery.addCondition('AND', 'id', id);

  const members = await this._accessor.execute(selectQuery);

  const isExists = !!(members).length;
  if (isExists) {
    throw new Error(id + ' already exsists');
  }

  const insertQuery = new InsertQuery(memberModel);
  insertQuery.setValues({id: id, password: password, admin: admin});
  await this._accessor.execute(insertQuery);
}

Authenticator.prototype.login = async function (id, password, client) {
  const selectQuery = new SelectQuery(memberModel);
  selectQuery.addCondition('AND', 'id', id);
  selectQuery.addCondition('AND', 'password', password);

  const member = await this._accessor.execute(selectQuery);
  if (!member.length) {
    throw new Error(id + ' is not found.');
  } else if (member[0].token != null) {
    throw new Error(id + ' is already login.');
  }

  const token = this.generateToken();

  const updateQuery = new UpdateQuery(memberModel);
  updateQuery.setUpdateValues({token: token, client: client});
  updateQuery.addCondition('AND', 'id', id);
  updateQuery.addCondition('AND', 'password', password);

  const result = await this._accessor.execute(updateQuery);
  if (!result) {
    throw new Error(id + ' is login failed.');
  }

  return token;
}

Authenticator.prototype.logout = async function (id, token, client) {
  const updateQuery = new UpdateQuery(memberModel);
  updateQuery.setUpdateValues({token: null, client: null});
  updateQuery.addCondition('AND', 'id', id);
  updateQuery.addCondition('AND', 'token', token);
  updateQuery.addCondition('AND', 'client', client);

  const result = await this._accessor.execute(updateQuery);
  if (!result) {
    logger.error.error(id + ' is logout failed.');
    return false;
  }

  return true;
}

Authenticator.prototype.authenticate = async function (token, client) {
  const selectQuery = new SelectQuery(memberModel);
  selectQuery.addCondition('AND', 'token', token);
  selectQuery.addCondition('AND', 'client', client);

  const result = await this._accessor.execute(selectQuery);
  if (result.length) {
    return result[0].id;
  }

  return null;
}

Authenticator.prototype.generateToken = function () {
  return uniqid() + uniqid();
}

module.exports = Authenticator;