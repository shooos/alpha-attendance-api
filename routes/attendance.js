const Router = require('express-promise-router');
const router = new Router();
const logger = require('../system/logger');
const uniqid = require('uniqid');
const authorization = require('../system/authorization');
const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');

/* Queries */
const InsertQuery = require('../accessor/sql/postgres/insert-query');
const UpdateQuery = require('../accessor/sql/postgres/update-query');
const SelectQuery = require('../accessor/sql/postgres/select-query');

/* Models */
const estimateTimeModel = require('../accessor/model/estimate-time');
const estimateUnclaimedModel = require('../accessor/model/estimate-unclaimed-time');
const actualTimeModel = require('../accessor/model/actual-time');
const actualDetailModel = require('../accessor/model/actual-time-detail');

module.exports = (accessor) => {
  /**
   * 認証処理
   */
  router.use(authorization(accessor));

  /**
   * 稼働予定登録・更新
   */
  router.post('/estimate', async (req, res) => {
    const body = req.body;
    if (!body) {
      logger.error.error(MSG.BODY_PARAMS_REQUIRED);
      return res.send({error: true, message: MSG.BODY_PARAMS_REQUIRED});
    }

    const authUser = req.authUser;
    if (authUser !== body.memberId) {
      logger.error.error(MSG.UPDATE_NOT_PERMITTED);
      return res.send({error: true, message: MSG.UPDATE_NOT_PERMITTED});
    }

    const updateQuery = new UpdateQuery(estimateTimeModel);
    updateQuery.addCondition('AND', 'estimate_id', body.estimateId);
    updateQuery.setValues({
      date: body.date,
      start_time: body.startTime,
      end_time: body.endTime,
    }, authUser);

    const updateResult = await accessor.execute(updateQuery);

    // 更新対象がなかったら挿入
    if (updateResult === 0) {
      const insertQuery = new InsertQuery(estimateTimeModel);
      const values = createValuesObject(estimateTimeModel, body);
      values.estimate_id = uniqid();
      insertQuery.setValues(values, authUser);

      await accessor.execute(insertQuery);
    }

    for (let record of body.detail) {
      const updateUnclaimed = new UpdateQuery(estimateUnclaimedModel);
      updateUnclaimed.addCondition('AND', 'estimate_id', body.estimateId);
      updateUnclaimed.addCondition('AND', 'begin_time', record.beginTime);
      const updateResult = await accessor.execute(updateUnclaimed);

      if (updateResult === 0) {
        const insertUnclaimed = new InsertQuery(estimateUnclaimedModel);
        insertUnclaimed.setValues();
      }
    }

    return res.send({data: true});
  });

  /**
   * 稼働予定一覧取得（年月指定）
   */
  router.get('/estimates/:memberId/:year?/:month?', async (req, res) => {
    if (req.authUser !== req.params.memberId) {
      logger.error.error(MSG.SELECT_NOT_PERMITTED);
      return res.send({error: true, message: MSG.SELECT_NOT_PERMITTED});
    }

    const current = new Date();
    const year = req.params.year || (current.getFullYear());
    const month = req.params.month || (current.getMonth() + 1);

    const selectQuery = new SelectQuery(estimateTimeModel);
    selectQuery.addCondition('AND', 'member_id', req.params.memberId);
    selectQuery.addCondition('AND', 'EXTRACT(YEAR FROM date)', year);
    selectQuery.addCondition('AND', 'EXTRACT(MONTH FROM date)', month);
    const results = await accessor.execute(selectQuery);

    return res.send({data: results});
  });

  /**
   * 稼働予定1件取得（日付指定）
   */
  router.get('/estimate/:memberId/:date?', async (req, res) => {
    if (req.authUser !== req.params.memberId) {
      logger.error.error(MSG.SELECT_NOT_PERMITTED);
      return res.send({error: true, message: MSG.SELECT_NOT_PERMITTED});
    }

    const date = new Date() || req.params.date;
    const selectQuery = new SelectQuery(estimateTimeModel);
    selectQuery.addCondition('AND', 'member_id', req.params.memberId);
    selectQuery.addCondition('AND', 'date', date);
    const results = await accessor.execute(selectQuery);

    return res.send({data: results[0]});
  });

  /**
   * 稼働実績登録・更新
   */
  router.post('/actual', async (req, res) => {
    const body = req.body;
    if (!body) {
      logger.error.error(MSG.BODY_PARAMS_REQUIRED);
      return res.send({error: true, message: MSG.BODY_PARAMS_REQUIRED});
    }

    const authUser = req.authUser;
    if (authUser !== body.memberId) {
      logger.error.error(MSG.UPDATE_NOT_PERMITTED);
      return res.send({error: true, message: MSG.UPDATE_NOT_PERMITTED});
    }

    if (body.actualId != null) {
      const updateQuery = new UpdateQuery(actualTimeModel);
      updateQuery.addCondition('AND', 'actual_id', body.actualId);
      updateQuery.setUpdateValues({
        work_pattern: body.workPattern,
        start_time: body.startTime,
        end_time: body.endTime,
        duty_hours: body.dutyHours,
        night_hours: body.nightHours,
        semi_absence_hours: body.semiAbsenceHours,
      }, authUser);

      accessor.execute(updateQuery);
    } else {
      const insertQuery = new InsertQuery(actualTimeModel);
      const values = createValuesObject(actualTimeModel, body);
      values.actual_id = uniqid();
      insertQuery.setValues(values, authUser);

      accessor.execute(insertQuery);
    }

    return res.send({data: true});
  });

  /**
   * 稼働実績一覧取得（年月指定）
   */
  router.get('/actuals/:memberId/:year?/:month?', async (req, res) => {
    if (req.authUser !== req.params.memberId) {
      logger.error.error(MSG.SELECT_NOT_PERMITTED);
      return res.send({error: true, message: MSG.SELECT_NOT_PERMITTED});
    }

    const current = new Date();
    const year = req.params.year || (current.getFullYear());
    const month = req.params.month || (current.getMonth() + 1);

    const selectQuery = new SelectQuery(actualTimeModel);
    selectQuery.addCondition('AND', 'member_id', req.params.memberId);
    selectQuery.addCondition('AND', 'EXTRACT(YEAR FROM date)', year);
    selectQuery.addCondition('AND', 'EXTRACT(MONTH FROM date)', month);
    const results = await accessor.execute(selectQuery);

    return res.send({data: results});
  });

  /**
   * 稼働実績1件取得（日時指定）
   */
  router.get('/actual/:memberId/:date?', async (req, res) => {
    if (req.authUser !== req.params.memberId) {
      logger.error.error(MSG.SELECT_NOT_PERMITTED);
      return res.send({error: true, message: MSG.SELECT_NOT_PERMITTED});
    }

    const date = new Date() || req.params.date;
    const selectQuery = new SelectQuery(actualTimeModel);
    selectQuery.addCondition('AND', 'member_id', req.params.memberId);
    selectQuery.addCondition('AND', 'date', date);
    const results = await accessor.execute(selectQuery);

    return res.send({data: results[0]});
  });

  return router;
};
