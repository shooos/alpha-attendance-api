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
    logger.system.debug('work-pattern-service#registerWorkPattern', data);

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

  /** 勤務形態一覧取得 */
  const getWorkPatterns = async () => {
    logger.system.debug('work-pattern-service#getWorkPatterns');

    const selectQuery = new SelectQuery(workPatternModel);
    selectQuery.addOrderBy('work_pattern_id', 'ASC');
    const results = await accessor.execute(selectQuery);

    return results;
  }

  /** 勤務形態の取得 */
  const getWorkPattern = async (workPatternId) => {
    logger.system.debug('work-pattern-service#getWorkPattern', workPatternId);

    // キャッシュがあれば返す
    if (workPatternCache[workPatternId] != null) {
      return workPatternCache[workPatternId];
    }

    const selectQuery = new SelectQuery(workPatternModel);
    selectQuery.addCondition('AND', 'work_pattern_id', workPatternId);
    const results = await accessor.execute(selectQuery);

    // 一度取得したらキャッシュする
    workPatternCache[workPatternId] = results[0];

    return results[0];
  }

  /** 勤務形態タイムテーブルの取得 */
  const getWorkingHours = async (workPatternId) => {
    logger.system.debug('work-pattern-service#getWorkingHours', workPatternId);

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

  /** 休憩時間を除外した予測時間を計算する */
  const calcurateEstimateHours = async (workPatternId, estimate) => {
    logger.system.debug('work-pattern-service#calcurateEstimateHours', workPatternId, estimate);

    const result = {
      hours: '00:00',
      message: null,
    };
    const pattern = await getWorkPattern(workPatternId);
    const hours = await getWorkingHours(workPatternId);
    if (pattern == null || hours == null) {
      result.message = 'Work pattern [' + workPatternId + '] is not registerd.';
      return result;
    }

    let breakTime = '00:00';
    const start = timeCalcurator.max(pattern.startBeforeCoreTime, estimate.startTime);
    const end = timeCalcurator.min(pattern.endWorkingTime, estimate.endTime);
    const diff = timeCalcurator.subtraction(end, start);

    // 予測時間中の休憩時間を算出する
    hours.some((wh, index) => {
      const next = hours[index + 1];
      if (!next) {
        next = {startTime: pattern.endWorkingTime};
      }
      if (timeCalcurator.compare(start, next.startTime) <= 0) return false;
      if (timeCalcurator.compare(end, next.startTime) >= 0 && !wh.breakTime) return true;

      if (wh.breakTime) {
        const begin = timeCalcurator.max(start, wh.startTime);
        const finish = timeCalcurator.min(next.startTime, end);
        breakTime = timeCalcurator.addition(breakTime, timeCalcurator.subtraction(finish, begin));
      }
    });

    result.hours = timeCalcurator.subtraction(diff, breakTime);
    return result;
  }

  /** 休憩時間を除外した勤務時間を計算する */
  const calcurateWorkingTime = async (workPatternId, detail) => {
    logger.system.debug('work-pattern-service#calcurateWorkingTime', workPatternId, detail);

    const result = {
      dutyHours: '00:00',
      startTime: '00:00',
      endTime: '00:00',
      times: [],
      message: null,
    };
    const pattern = await getWorkPattern(workPatternId);
    const hours = await getWorkingHours(workPatbreakTimeternId);
    if (pattern == null || hours == null) {
      result.message = 'Work pattern [' + workPatternId + '] is not registerd.';
      return result;
    }

    const wTimes = {};
    let start = '99:99';
    let end = '00:00';
    let index = 0;
    let length = hours.length;
    for (let t of [].concat(detail)) {
      let begin = timeCalcurator.max(t.beginTime, pattern.startBeforeCoreTime);
      let finish = timeCalcurator.min(t.finishTime, pattern.endWorkingTime);
      let breakTime = '00:00';

      for (; index < length; index++) {
        const wh = hours[index];
        const next = hours[index + 1];
        if (!next) {
          next = {startTime: pattern.endWorkingTime};
        }
        if (timeCalcurator.compare(begin, next.startTime) <= 0) continue;
        if (timeCalcurator.compare(finish, next.startTime) >=0 && !wh.breakTime) {
          index--;
          break;
        }

        if (wh.breakTime) {
          // 勤務時間中の休憩時間を合算
          breakTime = timeCalcurator.addition(breakTime, timeCalcurator.subtraction(next.startTime, wh.startTime));
        }
      }

      start = timeCalcurator.min(start, begin);
      end = timeCalcurator.max(end, finish);

      const workTime = timeCalcurator.subtraction(timeCalcurator.subtraction(finish, begin), breakTime);
      let time = wTimes[t.pCode] || '00:00';
      wTimes[t.pCode] = timeCalcurator.addition(time, workTime);
    }

    const times = [];
    let dutyHours = '00:00';
    for (let pCode of Object.keys(wTimes)) {
      dutyHours = timeCalcurator.addition(dutyHours, wTimes[pCode]);
      times.push({
        pCode: pCode,
        dutyHours: wTimes[pCode],
      });
    }

    result.dutyHours = dutyHours;
    result.startTime = start;
    result.endTime = end;
    result.times = times;
    return result;
  }

  return {
    registerWorkPattern: registerWorkPattern,
    getWorkPatterns: getWorkPatterns,
    getWorkPattern: getWorkPattern,
    getWorkingHours: getWorkingHours,
    calcurateEstimateHours: calcurateEstimateHours,
    calcurateWorkingTime: calcurateWorkingTime,
  }
}
