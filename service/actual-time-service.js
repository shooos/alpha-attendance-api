const uniqid = require('uniqid');
const moment = require('moment');
const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');
const logger = require('../system/logger');
const timeCalcurator = require('../system/time-calcurator');

/* Queries */
const UpsertQuery = require('../accessor/sql/postgres/upsert-query');
const SelectQuery = require('../accessor/sql/postgres/select-query');

/* Models */
const actualTimeModel = require('../accessor/model/actual-time');
const actualDetailModel = require('../accessor/model/actual-time-detail');
const actualPcodeHoursModel = require('../accessor/model/actual-time-pcode');

module.exports = (accessor) => {
  /* Serviceis */
  const workPatternService = require('../service/work-pattern-service')(accessor);

  /**
   * 実稼働時間の登録・更新
   */
  const registerActualTime = async (authUser, data) => {
    logger.system.debug('actual-time-service#registerActualTime', data);

    const workingHours = await workPatternService.calcurateWorkingTime(data.workPattern, data.detail);
    if (workingHours.message) {
      logger.system.debug(workingHours.message, workingHours);
    }

    const queries = [];
    const actualId = data.actualId || uniqid();

    const upsertActual = new UpsertQuery(actualTimeModel);
    const values = createValuesObject(actualTimeModel, data);
    values.actual_id = actualId;
    values.start_time = workingHours.startTime;
    values.end_time = workingHours.endTime;
    values.duty_hours = workingHours.dutyHours;
    upsertActual.setValues(values, authUser);
    queries.push(upsertActual);

    // 詳細時間の更新・登録
    for (let record of data.detail) {
      const upsertDetail = new UpsertQuery(actualDetailModel);
      const values = createValuesObject(actualDetailModel, record);
      values.actual_id = actualId;
      upsertDetail.setValues(values, authUser);
      queries.push(upsertDetail);
    }

    // P-CODEごとの勤務時間を更新・登録
    for (let time of workingHours.times) {
      const upsertPcodeHours = new UpsertQuery(actualPcodeHoursModel);
      const values = {
        actual_id: actualId,
        p_code: time.pCode,
        duty_hours: time.dutyHours,
      };
      upsertPcodeHours.setValues(values, authUser);
      queries.push(upsertPcodeHours);
    }

    await accessor.execute(queries);
    return actualId;
  }

  /**
   * 実稼働時間の取得
   */
  const getActualTime = async (condition) => {
    logger.system.debug('actual-time-service#getActualTime', condition);

    const selectQuery = new SelectQuery(actualTimeModel);
    selectQuery.addCondition('AND', 'member_id', condition.memberId);
    if (condition.year) {
      selectQuery.addCondition('AND', 'EXTRACT(YEAR FROM date)', condition.year);
    }
    if (condition.month) {
      selectQuery.addCondition('AND', 'EXTRACT(MONTH FROM date)', condition.month);
    }
    if (condition.date) {
      selectQuery.addCondition('AND', 'date', condition.date);
    }
    const actualTimes = await accessor.execute(selectQuery);

    const results = [];
    for (let actual of actualTimes) {
      const actualId = actual.actualId;

      const selectDetailQuery = new SelectQuery(actualDetailModel);
      selectDetailQuery.addCondition('AND', 'actual_id', actualId);
      selectDetailQuery.addOrderBy('begin_time', 'ASC');
      const detail = await accessor.execute(selectDetailQuery);

      const result = actual;
      result.detail = detail;
      results.push(result);
    }

    return results;
  }

  /** 勤務時間サマリ取得 */
  const getActualTimeSummery = async (condition) => {
    logger.system.debug('actual-time-service#getActualTimeSummery', condition);

    const selectQuery = new SelectQuery(actualTimeModel);
    if (condition.memberId) {
      selectQuery.addCondition('AND', 'member_id', condition.memberId);
    }
    selectQuery.addCondition('AND', 'EXTRACT(YEAR FROM date)', condition.year);
    selectQuery.addCondition('AND', 'EXTRACT(MONTH FROM date)', condition.month);
    selectQuery.addOrderBy('member_id', 'ASC');
    selectQuery.addOrderBy('date', 'ASC');
    const actualTimes = await accessor.execute(selectQuery);

    // TODO: P-CODEごとに時間集計して返す。
  }

  return {
    registerActualTime: registerActualTime,
    getActualTime: getActualTime,
    getActualTimeSummery: getActualTimeSummery,
  }
}
