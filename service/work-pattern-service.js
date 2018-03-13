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
  const calcurateWorkingTime = async (start, end, workPatternId) => {
    const pattern = await getWorkPattern(workPatternId);
    const hours = await getWorkingHours(workPatternId);
    let startTime = start;
    let endTime = end;

    if (pattern == null || hours == null) {
      return {
        dutyHours: timeSubtraction(endTime, startTime),
        startTime: startTime,
        endTime: endTime,
        message: 'Work pattern [' + workPatternId + '] is not registerd.',
      };
    }

    if (startTime > endTime
        || pattern.endWorkingTime < startTime
        || pattern.startWorkingTime > endTime) {
      return {
        dutyHours: '00:00',
        startTime: startTime,
        endTime: endTime,
        message: 'Work time is wrog.',
      };
    }

    if (pattern.startBeforeCoreTime > startTime) {
      startTime = pattern.startBeforeCoreTime;
    }
    if (pattern.endWorkingTime < endTime) {
      endTime = pattern.endWorkingTime;
    }

    let breakingTime = '00:00';
    let message;
    hours.some((wh, index) => {
      if (wh.startTime < startTime && wh.breakTime) {
        // 休憩時間にHitするときは次の勤務時間の開始時間を開始時間にする
        const next = hours[index + 1];
        if (next != null) {
          if (next.breakTime) return false;
          startTime = next.startTime
        }
      }
      if (wh.startTime > endTime) {
        if (hours[index - 1] && hours[index - 1].breakTime) {
          message = '終業時刻が休憩時間中になっているため勤務時間延長申請を行ってください。';
        }
        // 終業時刻帯まででループ終了
        return true;
      }
      if (wh.breakTime) {
        const finishTime = hours[index + 1] ? hours[index + 1].startTime : pattern.endWorkingTime;
        breakingTime = timeAddition(breakingTime, timeSubtraction(finishTime, wh.startTime));
      }
    });

    const dutyHours = timeSubtraction(timeSubtraction(endTime, startTime), breakingTime);
    return {
      dutyHours: dutyHours,
      startTime: startTime,
      endTime: endTime,
      message: message,
    };
  }

  /** 時間差分 */
  const timeSubtraction = (a, b) => {
    const A = a.split(':');
    const B = b.split(':');

    const Amm = A.pop() - 0;
    const Ahh = A.pop() - 0;
    const Bmm = B.pop() - 0;
    const Bhh = B.pop() - 0;

    if (Amm < Bmm) {
      // 桁借り
      Ahh--;
      Amm += 60;
    }

    const mm = Amm - Bmm;
    const hh = Ahh - Bhh;

    return [hh, mm].join(':');
  }

  /** 時間加算 */
  const timeAddition = (a, b) => {
    const A = a.split(':');
    const B = b.split(':');

    const Amm = A.pop() - 0;
    const Ahh = A.pop() - 0;
    const Bmm = B.pop() - 0;
    const Bhh = B.pop() - 0;

    let mm = Amm + Bmm;
    let up = 0;
    if (mm >= 60) {
      // 桁上がり
      up = Math.floor(mm / 60);
      mm %= 60;
    }
    const hh = Ahh + Bhh + up;

    return [hh, mm].join(':');
  }

  return {
    registerWorkPattern: registerWorkPattern,
    getWorkPattern: getWorkPattern,
    getWorkingHours: getWorkingHours,
    calcurateWorkingTime: calcurateWorkingTime,
  }
}
