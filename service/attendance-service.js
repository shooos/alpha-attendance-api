const moment = require('moment');
const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');
const logger = require('../system/logger');
const timeCalc = require('../system/time-calcurator');

/* Queries */
const SelectQuery = require('../accessor/sql/postgres/select-query');

/* Models */
const actualTimeModel = require('../accessor/model/actual-time');
const actualPcodeHoursModel = require('../accessor/model/actual-time-pcode');
const estimateTimeModel = require('../accessor/model/estimate-time');

module.exports = (accessor) => {

  /* 月間サマリ取得 */
  const getSummary = async (condition) => {
    const actualSummary = await _getActualSummary(condition);
    const estimateSummary = await _getEstimateSummary(condition);
    return {
      actuals: actualSummary,
      estimates: estimateSummary,
    };
  }

  /* 稼働実績のP-Codeごとの月間サマリ取得 */
  const _getActualSummary = async (condition) => {
    const values = [];
    values.push(condition.year);
    values.push(condition.month);

    const sql = [];
    sql.push('SELECT T1.member_id, T2.p_code, T2.duty_hours FROM actual_time T1');
    sql.push('INNER JOIN actual_time_pcode T2 ON T1.actual_id=T2.actual_id');
    sql.push('WHERE');
    sql.push('EXTRACT(YEAR FROM T1.date)=$1');
    sql.push('AND EXTRACT(MONTH FROM T1.date)=$2');
    if (condition.memberId) {
      sql.push('AND T1.member_id=$3');
      values.push(condition.memberId);
    }
    sql.push('ORDER BY T1.date, T2.p_code;');

    const query = {
      text: sql.join(' '),
      values: values
    }
    const responses = await accessor._executeQuery([query]);
    const results = {};
    for (let record of responses[0]) {
      const member = results[record.member_id] || (results[record.member_id] = {});
      const summary = member[record.p_code] || '0:00';
      member[record.p_code] = timeCalc.addition(summary, moment.utc(moment.duration(record.duty_hours).asMilliseconds()).format('H:mm'));
    }

    return results;
  }

  /* 稼働予測の月間サマリ取得 */
  const _getEstimateSummary = async (condition) => {
    const selectQuery = new SelectQuery(estimateTimeModel);
    selectQuery.addCondition('AND', 'EXTRACT(YEAR FROM date)', condition.year);
    selectQuery.addCondition('AND', 'EXTRACT(MONTH FROM date)', condition.month);
    if (condition.memberId) {
      selectQuery.addCondition('AND', 'member_id', condition.memberId);
      selectQuery.addOrderBy('member_id', 'ASC');
    }
    selectQuery.addOrderBy('date', 'ASC');

    const responses = await accessor.execute(selectQuery);
    const results = {};
    for (let record of responses) {
      const member = results[record.memberId] || (results[record.memberId] = {});
      const claimed = member.claimed || '0:00';
      const unclaimed = member.unclaimed || '0:00';
      if (!record.dayOff) {
        member.claimed = timeCalc.addition(claimed, timeCalc.subtraction(record.estimateHours, record.unclaimedHours));
        member.unclaimed = timeCalc.addition(unclaimed, record.unclaimedHours);
      }
    }

    return results;
  }

  return {
    getSummary: getSummary,
  };
}
