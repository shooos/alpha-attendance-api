const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');

/* Queries */
const InsertQuery = require('../accessor/sql/postgres/insert-query');
const UpdateQuery = require('../accessor/sql/postgres/update-query');
const SelectQuery = require('../accessor/sql/postgres/select-query');

/* Models */
const estimateTimeModel = require('../accessor/model/estimate-time');
const estimateUnclaimedModel = require('../accessor/model/estimate-unclaimed-time');

module.exports = async (accessor) => {
  const registerEstimateTime = (data) => {

  }

  const getEstimateTime = async () => {

  }

  const registerEstimateUnclaimed = async () => {

  }

  const getEstimateUnclaimed = async () => {

  }

  return {
    registerEstimateTime: registerEstimateTime,
    getEstimateTime: getEstimateTime,
    registerEstimateUnclaimed: registerEstimateUnclaimed,
    getEstimateUnclaimed: getEstimateUnclaimed,
  }
}
