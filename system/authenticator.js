const moment = require('moment');
const uniqid = require('uniqid');
const memberModel = require('../accessor/model/member');
const logger = require('../system/logger');

/* Queries */
const SelectQuery = require('../accessor/sql/postgres/select-query');
const UpdateQuery = require('../accessor/sql/postgres/update-query');
const InsertQuery = require('../accessor/sql/postgres/insert-query');

/* Config */
const systemConf = require('../config/system-config.json');

const Authenticator = function (accessor) {
  this._accessor = accessor;
}

/** 初期化 */
Authenticator.prototype.initialize = async function() {
  const initializeQuery = new UpdateQuery(memberModel);
  initializeQuery.setUpdateValues({
    token: null,
    client: null,
    auth_time: null,
  });
  initializeQuery.addCondition('AND', 'token', null, true);
  await this._accessor.execute(initializeQuery);
}

/** メンバ登録 */
Authenticator.prototype.register = async function (memberId, password, admin) {
  const selectQuery = new SelectQuery(memberModel);
  selectQuery.addCondition('AND', 'member_id', memberId);

  const members = await this._accessor.execute(selectQuery);

  const isExists = !!(members).length;
  if (isExists) {
    throw new Error(memberId + ' already exsists.');
  }

  const insertQuery = new InsertQuery(memberModel);
  insertQuery.setValues({member_id: memberId, password: password, admin: admin});
  await this._accessor.execute(insertQuery);
}

/** ログイン */
Authenticator.prototype.login = async function (memberId, password, client) {
  const selectQuery = new SelectQuery(memberModel);
  selectQuery.addCondition('AND', 'member_id', memberId);
  selectQuery.addCondition('AND', 'password', password);

  const member = await this._accessor.execute(selectQuery);
  if (!member.length) {
    throw new Error(memberId + ' is not found.');
  } else if (member[0].token != null) {
    throw new Error(memberId + ' is already login.');
  }

  const token = this.generateToken();

  const updateQuery = new UpdateQuery(memberModel);
  updateQuery.setUpdateValues({
    token: token,
    client: client,
    auth_time: moment().utc(),
  });
  updateQuery.addCondition('AND', 'member_id', memberId);
  updateQuery.addCondition('AND', 'password', password);

  const result = await this._accessor.execute(updateQuery);
  if (!result) {
    throw new Error(memberId + ' is login failed.');
  }

  return token;
}

/** ログアウト */
Authenticator.prototype.logout = async function (memberId) {
  const updateQuery = new UpdateQuery(memberModel);
  updateQuery.setUpdateValues({
    token: null,
    client: null,
    auth_time: null,
  });
  updateQuery.addCondition('AND', 'member_id', memberId);
  updateQuery.addCondition('AND', 'token', null, true);
  updateQuery.addCondition('AND', 'client', null, true);

  const result = await this._accessor.execute(updateQuery).catch((err) => {
    logger.error.error('Logout failed.', err);
    return false;
  });
  if (!result.length) {
    logger.error.error(memberId + ' is not logged in.');
    return false;
  }

  return true;
}

/** 認証 */
Authenticator.prototype.authenticate = async function (token, client) {
  const selectQuery = new SelectQuery(memberModel);
  selectQuery.addCondition('AND', 'token', token);
  selectQuery.addCondition('AND', 'client', client);

  const result = await this._accessor.execute(selectQuery).catch((err) => {
    throw new Error('Authentication Error.');
  });
  if (!result.length) {
    throw new Error('Invalid token.');
  }
  if (moment(moment()).diff(result[0].authTime) > systemConf.authentication.effectiveTime) {
    throw new Error('Token expired.');
  }

  const newToken = this.generateToken();
  const updateQuery = new UpdateQuery(memberModel);
  updateQuery.setUpdateValues({
    token: newToken,
    auth_time: moment().utc(),
  });
  updateQuery.addCondition('AND', 'token', token);
  updateQuery.addCondition('AND', 'client', client);
  await this._accessor.execute(updateQuery);

  return {
    memberId: result[0].memberId,
    token: newToken,
  };
}

/** トークンの生成 */
Authenticator.prototype.generateToken = function () {
  return uniqid();
}

module.exports = Authenticator;