const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');
const logger = require('../system/logger');

/* Queries */
const InsertQuery = require('../accessor/sql/postgres/insert-query');
const UpdateQuery = require('../accessor/sql/postgres/update-query');
const UpsertQuery = require('../accessor/sql/postgres/upsert-query');
const SelectQuery = require('../accessor/sql/postgres/select-query');

/* Models */
const actualTimeModel = require('../accessor/model/actual-time');
const actualDetailModel = require('../accessor/model/actual-time-detail');

module.exports = async (accessor) => {

  /**
   * 実稼働時間の登録・更新
   * @param {*} data
   */
  const registerActualTime = async (data) => {
    logger.system.info('actual-time-service#registerActualTime', data);

    let startTime = '99:99';
    let endTime = '00:00';
    for (let record of data.detail) {
      // 24時間形式の時刻であることを前提としている
      startTime = record.beginTime < startTime ? record.beginTime : startTime;
      endTime = record.finishTime > endTime ? record.finishTime : endTime;
      // FIXME: dutyHours, nightHours, semiAbsenceHours を算出する
    }
    const queries = [];
    let actualId = data.actualId || uniqid();

    const upsertActual = new UpsertQuery(actualTimeModel);
    const values = createValuesObject(actualTimeModel, data);
    values.actual_id = actualId;
    values.start_time = startTime;
    values.end_time = endTime;
    // values.duty_hours = dutyHours;
    // values.night_hours = nightHours;
    // values.semi_absence_hours = semiAbsenceHours;
    upsertActual.setValues(values);
    queries.push(upsertActual);

    // 詳細時間の更新・登録
    for (let record of data.detail) {
      const upsertDetail = new UpsertQuery(actualDetailModel);
      const values = createValuesObject(actualDetailModel, record);
      values.actual_id = actualId;
      upsertDetail.setValues(values);
      queries.push(upsertDetail);
    }

    const results = await accessor.execute(queries);
    return results;
  }

  const getActualTime = async (memberId, condition) => {
    logger.system.info('actual-time-service#getActualTime', memberId, condition);

    const selectQuery = new SelectQuery(actualTimeModel);
    selectQuery.addCondition('AND', 'member_id', memberId);
    if (condition.year) {
      selectQuery.addCondition('AND', 'EXTRACT(YEAR FROM date)', condition.year);
    }
    if (condition.month) {
      selectQuery.addCondition('AND', 'EXTRACT(MONTH FROM date)', condition.month);
    }
    if (condition.date) {
      selectQuery.addCondition('AND', 'date', condition.date);
    }

    const results = await accessor.execute(selectQuery);
    return results;
  }

  return {
    registerActualTime: registerActualTime,
    getActualTime: getActualTime,
  }
}
