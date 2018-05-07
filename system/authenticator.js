const moment = require('moment');
const uuidv4 = require('uuid/v4');
const memberModel = require('../accessor/model/member');
const logger = require('../system/logger');

/* Queries */
const SelectQuery = require('../accessor/sql/postgres/select-query');
const UpsertQuery = require('../accessor/sql/postgres/upsert-query');
const UpdateQuery = require('../accessor/sql/postgres/update-query');
const InsertQuery = require('../accessor/sql/postgres/insert-query');

/* Config */
const systemConf = require('../config/system-config.json');

const Authenticator = function (accessor) {
  this._accessor = accessor;
}

/** ログイン */
Authenticator.prototype.login = async function (memberId, client) {
  logger.system.debug('authenticator#login', memberId, client);

  const token = this.generateToken();

  const upsertQuery = new UpsertQuery(memberModel);
  upsertQuery.setValues({
    'member_id': memberId,
    'token': token,
    'client': client,
    'auth_time': moment().utc(),
  }, memberId);

  const result = await this._accessor.execute(upsertQuery)
  .catch((err) => {
    logger.error.error('Login failed.', err);
    throw err;
  });

  if (!result || !result.length) {
    throw new Error(memberId + ' is login failed.');
  }

  return {
    user: memberId,
    token: token,
  };
}

/** ログアウト */
Authenticator.prototype.logout = async function (memberId) {
  logger.system.debug('authenticator#logout', memberId);

  const updateQuery = new UpdateQuery(memberModel);
  updateQuery.setUpdateValues({
    token: null,
    client: null,
    auth_time: null,
  });
  updateQuery.addCondition('AND', 'member_id', memberId);
  updateQuery.addCondition('AND', 'token', null, true);
  updateQuery.addCondition('AND', 'client', null, true);

  const result = await this._accessor.execute(updateQuery)
  .catch((err) => {
    logger.error.error('Logout failed.', err);
    throw err;
  });

  if (!result || !result.length) {
    logger.error.error(memberId + ' is not logged in.');
    return false;
  }

  return true;
}

/** 認証 */
Authenticator.prototype.authenticate = async function (token, client) {
  logger.system.debug('authenticator#authenticate', token, client);

  const selectQuery = new SelectQuery(memberModel);
  selectQuery.addCondition('AND', 'token', token);
  selectQuery.addCondition('AND', 'client', client);

  const result = await this._accessor.execute(selectQuery)
  .catch((err) => {
    const e = new Error('Authentication Error.');
    e.name = 'AuthenticationError';
    throw e;
  });

  if (!result.length) {
    const e = new Error('Invalid token.');
    e.name = 'AuthenticationError';
    throw e;
  }

  if (moment(moment()).diff(result[0].authTime) > systemConf.authentication.effectiveTime) {
    const e = new Error('Token expired.');
    e.name = 'AuthenticationError';
    throw e;
  }

  return {
    memberId: result[0].memberId,
  };
}

/** トークンの生成 */
Authenticator.prototype.generateToken = function () {
  return uuidv4();
}

module.exports = Authenticator;