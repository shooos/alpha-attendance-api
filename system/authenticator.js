const SelectQuery = require('../accessor/sql/postgres/select-query');
const UpdateQuery = require('../accessor/sql/postgres/update-query');
const memberModel = require('../accessor/model/member');
const uniqid = require('uniqid');
const logger = require('../system/logger');

const Authenticator = function (accessor) {
  this._accessor = accessor;
}

Authenticator.prototype.login = async function (id, password, host) {
  const selectQuery = new SelectQuery(memberModel);
  selectQuery.addCondition('AND', 'id', id);
  selectQuery.addCondition('AND', 'password', password);

  const member = await this._accessor.execute(selectQuery);
  logger.system.debug(member);
  if (!member.length) {
    logger.error.error(id + ' is not found.');
    return false;
  } else if (member[0].token != null) {
    logger.error.error(id + ' is already login.');
    return false;
  }

  const token = this.generateToken();

  const updateQuery = new UpdateQuery(memberModel);
  updateQuery.setUpdateValues({token: token, host: host});
  updateQuery.addCondition('AND', 'id', id);
  updateQuery.addCondition('AND', 'password', password);

  const result = await this._accessor.execute(updateQuery);
  console.log(result);
}

Authenticator.prototype.logout = function (id, token, host) {

}

Authenticator.prototype.authenticate = function (token) {

}

Authenticator.prototype.generateToken = function () {
  return uniqid();
}

module.exports = Authenticator;