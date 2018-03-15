const moment = require('moment');
const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');
const logger = require('../system/logger');
const timeCalcurator = require('../system/time-calcurator');

/* Queries */
const SelectQuery = require('../accessor/sql/postgres/select-query');
const UpsertQuery = require('../accessor/sql/postgres/upsert-query');

/* Models */
const workPatternModel = require('../accessor/model/work-pattern');
const workingHoursModel = require('../accessor/model/working-hours');

module.exports = (accessor) => {
  const workPatternCache = {};
  const workingHoursCache = {};

  /**
   * 勤務形態の登録・更新
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
      values.work_pattern_id = data.workPatternId;
      upsertHour.setValues(values, authUser);
      queries.push(upsertHour);
    }

    // 更新したらキャッシュを消す
    delete workPatternCache[data.workPatternId];
    delete workingHoursCache[data.workPatternId];

    const results = await accessor.execute(queries);
    return results;
  }

  /**
   * 勤務形態の取得
   */
  const getWorkPattern = async (workPatternId) => {
    logger.system.info('work-pattern-service#getWorkPattern', workPatternId);

    // キャッシュがあれば返す
    if (workPatternCache[workPatternId] != null) {
      return workPatternCache[workPatternId];
    }

    const selectQuery = new SelectQuery(workPatternModel);
    selectQuery.addCondition('AND', 'work_pattern_id', workPatternId);
    const results = await accessor.execute(selectQuery);

    // 一度取得したらキャッシュする
    workPatternCache[workPatternId] = results[0];

    return results;
  }

  /** 勤務形態タイムテーブルの取得 */
  const getWorkingHours = async (workPatternId) => {
    logger.system.info('work-pattern-service#getWorkingHours', workPatternId);

    // キャッシュがあれば返す
    if (workingHoursCache[workPatternId] != null) {
      return workingHoursCache[workPatternId];
    }

    const selectQuery = new SelectQuery(workingHoursModel);
    selectQuery.addCondition('AND', 'work_pattern_id', workPatternId);
    selectQuery.addOrderBy('start_time', 'ASC');
    const results = await accessor.execute(selectQuery);

    // 一度取得したらキャッシュする
    workingHoursCache[workPatternId] = results;

    return results;
  }

  /**
   * 休憩時間を除外した勤務時間を計算する
   */
  const calcurateWorkingTime = async (workPatternId, detail) => {
    const result = {
      message: '',
      times: [],
    };

    const pattern = await getWorkPattern(workPatternId);
    const hours = await getWorkingHours(workPatternId);
    if (pattern == null || hours == null) {
      result.message = 'Work pattern [' + workPatternId + '] is not registerd.';
      return result;
    }

    const times = [].concat(detail);
    const wTimes = [];
    for (let t of times) {
      let startTime = t.beginTime;
      let endTime = t.finishTime;
      if (timeCalcurator.compare(pattern.startBeforeCoreTime, t.startTime) === -1) {
        startTime = pattern.startBeforeCoreTime;
      }
      if (timeCalcurator.compare(pattern.endWorkingTime, t.finishTime) === 1) {
        endTime = pattern.endWorkingTime;
      }
      hours.some((wh, index) => {
        const next = hours[index + 1] || {};
        if (!next) {
          next.startTime = pattern.endWorkingTime;
        }

        if (timeCalcurator.compare(wh.startTime, t.beginTime) !== -1) {
          startTime = wh.breakTime ? wh.startTime : t.beginTime;
        }
        if (timeCalcurator.compare(next.startTime, t.finishTime) === -1) {
          endTime = wh.breakTime ? wh.endTime : t.finishTime;
          return true;
        }
      });
      const workTime = timeCalcurator.subtraction(endTime, startTime);
      wTimes.push({
        pCode: t.pCode,
        workTime: workTime,
      });
    }
  }

  return {
    registerWorkPattern: registerWorkPattern,
    getWorkPattern: getWorkPattern,
    getWorkingHours: getWorkingHours,
    calcurateWorkingTime: calcurateWorkingTime,
  }
}
