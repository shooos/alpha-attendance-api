const moment = require('moment');
const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');
const logger = require('../system/logger');

/* Queries */
const SelectQuery = require('../accessor/sql/postgres/select-query');
const UpsertQuery = require('../accessor/sql/postgres/upsert-query');

/* Models */
const workPatternModel = require('../accessor/model/work-pattern');
const workingHoursModel = require('../accessor/model/working-hours');

module.exports = (accessor) => {
  const workPatternCache = {};

  /**
   * 業務区分の登録・更新
   */
  const registerWorkPattern = async (authUser, data) => {
    logger.system.info('work-pattern-service#registerWorkPattern', data);

    const queries = [];
    const upsertPattern = new UpsertQuery(workPatternModel);
    const values = createValuesObject(workPatternModel, data);
    upsertPattern.setValues(values, authUser);
    queries.push(upsertPattern);

    for (let record of data.hours) {
      const upsertHour = new UpsertQuery(workingHoursModel);
      const values = createValuesObject(workingHoursModel, record);
      upsertHour.setValues(values, authUser);
      queries.push(upsertHour);
    }

    // 更新したらキャッシュを消す
    delete workPatternCache[data.workPatternId];

    const results = await accessor.execute(queries);
    return results;
  }

  /**
   * 業務区分の取得
   */
  const getWorkPattern = async (workPatternId) => {
    logger.system.info('work-pattern-service#getWorkPattern', workPatternId);

    // キャッシュがあれば返す
    if (workPatternCache[workPatternId] != null) {
      return workPatternCache[workPatternId];
    }

    const selectQuery = new SelectQuery(workPatternModel);
    selectQuery.addCondition('AND', 'work_pattern_id', workPatternId);
    selectQuery.naturalInnerJoin(workingHoursModel);
    const results = await accessor.execute(selectQuery);

    // 一度取得したらキャッシュする
    workPatternCache[workPatternId] = results;

    return results;
  }

  /**
   * 休憩時間を除外した勤務時間を計算する
   */
  const calcurateWorkingTime = async (startTime, endTime, workPattern) => {
    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');
    const pattern = await getWorkPattern(workPattern);
    console.log('===================================');
    console.log('pattern: ', pattern);
    console.log(start, end);
    console.log('===================================');
  }

  return {
    registerWorkPattern: registerWorkPattern,
    getWorkPattern: getWorkPattern,
    calcurateWorkingTime: calcurateWorkingTime,
  }
}
