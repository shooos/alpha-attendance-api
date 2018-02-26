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
  selectQuery.addAndCondition('id', id);
  selectQuery.addAndCondition('password', password);

  const member = await this._accessor.execute(selectQuery);
  if (!member.length) {
    logger.error.error(id + ' is not found.');
    return false;
  }

  const token = this.generateToken();

  const updateQuery = new UpdateQuery(memberModel);
  updateQuery.setUpdateValues({token: token, host: host});
  updateQuery.addAndCondition('id', id);
  updateQuery.addAndCondition('password', password);

  const result = await this._accessor.execute(updateQuery);
  console.log(result);
}

Authenticator.prototype.authenticate = function (token) {

}

Authenticator.prototype.generateToken = function () {
  return uniqid();
}

module.exports = Authenticator;