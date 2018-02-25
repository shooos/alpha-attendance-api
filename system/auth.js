const UpdateQuery = require('../accessor/sql/postgres/update-query');
const memberModel = require('../accessor/model/member');
const uniqid = require('uniqid');

const Auth = function (accessor) {
  this._accessor = accessor;
}

Auth.prototype.login = function (id, password) {
  const token = uniqid();
  const updateQuery = new UpdateQuery(memberModel);
}

Auth.prototype.authenticate = function (token) {

}

module.exports = Auth;