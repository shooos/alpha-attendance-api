const uniqid = require('uniqid');
const moment = require('moment');
const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');
const logger = require('../system/logger');
const timeCalc = require('../system/time-calcurator');

/* Queries */
const UpsertQuery = require('../accessor/sql/postgres/upsert-query');
const SelectQuery = require('../accessor/sql/postgres/select-query');

/* Models */
const estimateTimeModel = require('../accessor/model/estimate-time');

module.exports = (accessor) => {
  /* Serviceis */
  const workPatternService = require('../service/work-pattern-service')(accessor);

  /** 予測時間の登録・更新 */
  const registerEstimateTime = async (authUser, data) => {
    logger.system.debug('estimate-time-service#registerEstimateTime', authUser, data);

    const queries = [];
    for (let estimate of data) {
      const estimateHours = await workPatternService.calcurateEstimateHours(estimate.workPatternId, estimate);
      if (estimateHours.message) {
        logger.system.warn(estimateHours.message);
      }

      const upsertEstimate = new UpsertQuery(estimateTimeModel);
      const values = createValuesObject(estimateTimeModel, estimate);
      values.member_id = authUser;

      if (estimate.dayOff) {
        values.work_pattern_id = null;
        values.start_time = null;
        values.end_time = null;
        values.estimate_hours = '00:00';
        values.unclaimed_hours = '00:00';
      } else {
        values.estimate_hours = estimateHours.hours;
        values.unclaimed_hours || (values.unclaimed_hours = '00:00');
      }
      upsertEstimate.setValues(values, authUser);
      queries.push(upsertEstimate);
    }

    const results = await accessor.execute(queries);
    return results;
  }

  /** 予測時間の取得 */
  const getEstimateTime = async (condition) => {
    logger.system.debug('estimate-time-service#getEstimateTime', condition);

    const selectEstimate = new SelectQuery(estimateTimeModel);
    if (condition.memberId) {
      selectEstimate.addCondition('AND', 'member_id', condition.memberId);
    }
    if (condition.year) {
      selectEstimate.addCondition('AND', 'EXTRACT(YEAR FROM date)', condition.year);
    }
    if (condition.month) {
      selectEstimate.addCondition('AND', 'EXTRACT(MONTH FROM date)', condition.month);
    }
    if (condition.date) {
      selectEstimate.addCondition('AND', 'date', condition.date);
    }
    selectEstimate.addOrderBy('member_id', 'ASC');
    selectEstimate.addOrderBy('date', 'ASC');
    const estimates = await accessor.execute(selectEstimate);

    return estimates;
  }

  /** 予測時間サマリを取得 */
  const getEstimateTimeSummary = async (condition) => {
    logger.system.debug('estimate-time-service#getEstimateTimeSummery', condition);

    const selectEstimate = new SelectQuery(estimateTimeModel);
    if (condition.memberId) {
      selectEstimate.addCondition('AND', 'member_id', condition.memberId);
    }
    selectEstimate.addCondition('AND', 'EXTRACT(YEAR FROM date)', condition.year);
    selectEstimate.addCondition('AND', 'EXTRACT(MONTH FROM date)', condition.month);
    selectEstimate.addOrderBy('member_id', 'ASC');
    selectEstimate.addOrderBy('date', 'ASC');
    const estimates = await accessor.execute(selectEstimate);

    // 人ごとに総時間、請求時間、非請求時間を集計する
    const result = {};
    for (let estimate of estimates) {
      const memberId = estimate.memberId;

      if (!(memberId in result)) {
        result[memberId] = {
          estimateHours: '00:00',
          unclaimedHours: '00:00',
        };
      }
      result[memberId].estimateHours = timeCalc.addition(result[memberId].estimateHours, estimate.estimateHours);
      if (estimate.unclaimedHours) {
        result[memberId].unclaimedHours = timeCalc.addition(result[memberId].unclaimedHours, estimate.unclaimedHours);
      }
    }

    for (let memberId of Object.keys(result)) {
      const summary = result[memberId];
      summary.claimedHours = timeCalc.subtraction(summary.estimateHours, summary.unclaimedHours);
    }

    return result;
  }

  return {
    registerEstimateTime: registerEstimateTime,
    getEstimateTime: getEstimateTime,
    getEstimateTimeSummary: getEstimateTimeSummary,
  };
}
