const UpdateQuery = require('../accessor/sql/postgres/update-query');
const memberModel = require('../accessor/model/member');
const uniqid = require('uniqid');

const Auth = function (accessor) {
  this._accessor = accessor;
}

Auth.prototype.login = function (id, password) {
  const updateQuery = new UpdateQuery(memberModel);
  updateQuery.setUpdateValues({token: token});
}

Auth.prototype.authenticate = function (token) {

}

Auth.prototype.generateToken = function (id, password) {
  const token = uniqid();
}

module.exports = Auth;