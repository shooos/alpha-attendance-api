const moment = require('moment');
const uuidv4 = require('uuid/v4');
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

/** メンバ登録 */
Authenticator.prototype.register = async function (memberId, password, admin) {
  logger.system.debug('authenticator#register', memberId, password, admin);

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
  logger.system.debug('authenticator#login', memberId, password, client);

  const selectQuery = new SelectQuery(memberModel);
  selectQuery.addCondition('AND', 'member_id', memberId);
  selectQuery.addCondition('AND', 'password', password);

  const member = await this._accessor.execute(selectQuery);
  if (!member.length) {
    const MemberNotFoundError = new Error(memberId + ' is not found.');
    MemberNotFoundError.name = 'MemberNotFoundError';
    throw MemberNotFoundError;
  } else if (member[0].token != null) {
    const AlreadyLoginError = new Error(memberId + ' is already login.');
    AlreadyLoginError.name = 'AlreadyLoginError';
    throw AlreadyLoginError;
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
  logger.system.debug('authenticator#authenticate', token, client);

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

  // Tokenの有効期限を延長する
  const updateQuery = new UpdateQuery(memberModel);
  updateQuery.setUpdateValues({
    auth_time: moment().utc(),
  });
  updateQuery.addCondition('AND', 'token', token);
  updateQuery.addCondition('AND', 'client', client);
  await this._accessor.execute(updateQuery)
    .catch(() => {
      // 有効期限延長に失敗してもエラーにしない.
    });

  return {
    memberId: result[0].memberId,
  };
}

/** トークンの生成 */
Authenticator.prototype.generateToken = function () {
  return uuidv4();
}

module.exports = Authenticator;