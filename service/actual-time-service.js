const uniqid = require('uniqid');
const moment = require('moment');
const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');
const logger = require('../system/logger');

/* Queries */
const UpsertQuery = require('../accessor/sql/postgres/upsert-query');
const SelectQuery = require('../accessor/sql/postgres/select-query');

/* Models */
const actualTimeModel = require('../accessor/model/actual-time');
const actualDetailModel = require('../accessor/model/actual-time-detail');

module.exports = (accessor) => {
  /* Serviceis */
  const workPatternService = require('../service/work-pattern-service')(accessor);

  /**
   * 実稼働時間の登録・更新
   */
  const registerActualTime = async (authUser, data) => {
    logger.system.info('actual-time-service#registerActualTime', data);

    let startTime = '99:99';
    let endTime = '00:00';
    for (let record of data.detail) {
      // 24時間形式の時刻であることを前提としている
      startTime = record.beginTime < startTime ? record.beginTime : startTime;
      endTime = record.finishTime > endTime ? record.finishTime : endTime;
    }
    const workingHours = await workPatternService.calcurateWorkingTime(startTime, endTime, data.workPattern);
    logger.system.debug(workingHours);
    const queries = [];
    const actualId = data.actualId || uniqid();

    const upsertActual = new UpsertQuery(actualTimeModel);
    const values = createValuesObject(actualTimeModel, data);
    values.actual_id = actualId;
    values.start_time = startTime;
    values.end_time = endTime;
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

    await accessor.execute(queries);
    return actualId;
  }

  /**
   * 実稼働時間の取得
   */
  const getActualTime = async (authUser, condition) => {
    logger.system.info('actual-time-service#getActualTime', authUser, condition);

    const selectQuery = new SelectQuery(actualTimeModel);
    selectQuery.addCondition('AND', 'member_id', authUser);
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

  return {
    registerActualTime: registerActualTime,
    getActualTime: getActualTime,
  }
}
