const Router = require('express-promise-router');
const router = new Router();
const logger = require('../system/logger');
const authorization = require('../system/authorization');
const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');

module.exports = (accessor) => {
  /* Services */
  const attendanceService = require('../service/attendance-service')(accessor);
  const estimateService = require('../service/estimate-time-service')(accessor);
  const actualService = require('../service/actual-time-service')(accessor);

  /** 認証 */
  router.use(authorization(accessor));

  /** 稼働予定登録・更新 */
  router.post('/estimate', async (req, res) => {
    const body = req.body;
    if (!body) {
      logger.error.error(MSG.BODY_PARAMS_REQUIRED);
      return res.send({error: true, message: MSG.BODY_PARAMS_REQUIRED});
    }
    if (!Array.isArray(body.detail)) {
      logger.error.error('Parameter [detail] is required');
      return res.send({error: true, message: 'Parameter [detail] is required'});
    }

    const authUser = req.authUser;
    if (authUser !== body.memberId) {
      logger.error.error(MSG.UPDATE_NOT_PERMITTED);
      return res.send({error: true, message: MSG.UPDATE_NOT_PERMITTED});
    }

    const results = await estimateService.registerEstimateTime(authUser, body.detail);
    return res.send({data: results});
  });

  /** 稼働予定一覧取得（年月指定） */
  router.get('/estimates/:memberId/:year?/:month?', async (req, res) => {
    const current = new Date();
    const results = await estimateService.getEstimateTime({
      memberId: req.params.memberId,
      year: req.params.year || (current.getFullYear()),
      month: req.params.month || (current.getMonth() + 1),
    });
    return res.send({data: results});
  });

  /** 稼働予定1件取得（日付指定） */
  router.get('/estimate/:memberId/:date?', async (req, res) => {
    const results = await estimateService.getEstimateTime({
      memberId: req.params.memberId,
      date: req.params.date || new Date(),
    });
    return res.send({data: results[0]});
  });

  /** 稼働実績登録・更新 */
  router.post('/actual', async (req, res) => {
    const body = req.body;
    if (!body) {
      logger.error.error(MSG.BODY_PARAMS_REQUIRED);
      return res.send({error: true, message: MSG.BODY_PARAMS_REQUIRED});
    }
    if (!Array.isArray(body.detail)) {
      logger.error.error('Parameter [detail] is required');
      return res.send({error: true, message: 'Parameter [detail] is required'});
    }

    const authUser = req.authUser;
    if (authUser !== body.memberId) {
      logger.error.error(MSG.UPDATE_NOT_PERMITTED);
      return res.send({error: true, message: MSG.UPDATE_NOT_PERMITTED});
    }

    const record = await actualService.getActualTime({
      memberId: body.memberId,
      date: body.date,
    });
    const result = await actualService.registerActualTime(authUser, {
      memberId: body.memberId,
      date: body.date,
      actualId: record.length ? record[0].actual_id : null,
      workPatternId: body.workPatternId,
      detail: body.detail,
    }).catch((err) => {
      logger.error.error(err.name, err.message);
      res.send({error: err.name, message: error.message});
      throw err;
    });

    return res.send({data: result});
  });

  /** 稼働実績一覧取得（年月指定） */
  router.get('/actuals/:memberId/:year?/:month?', async (req, res) => {
    const current = new Date();
    const results = await actualService.getActualTime({
      memberId: req.params.memberId,
      year: req.params.year || (current.getFullYear()),
      month: req.params.month || (current.getMonth() + 1),
    }).catch((err) => {
      logger.error.error(err.name, err.message);
      res.send({error: err.name, message: error.message});
      throw err;
    });

    return res.send({data: results});
  });

  /** 稼働実績1件取得（日時指定） */
  router.get('/actual/:memberId/:date?', async (req, res) => {
    const results = await actualService.getActualTime({
      memberId: req.params.memberId,
      date: req.params.date || new Date(),
    }).catch((err) => {
      logger.error.error(err.name, err.message);
      res.send({error: err.name, message: error.message});
      throw err;
    });

    return res.send({data: results[0]});
  });

  /** 稼働月間サマリ取得 */
  router.get('/summary/:year/:month/:memberId?', async (req, res) => {
    const results = await attendanceService.getSummary({
      year: req.params.year,
      month: req.params.month,
      membeId: req.params.memberId,
    }).catch((err) => {
      logger.error.error(err.name, err.message);
      res.send({error: err.name, message: err.message});
      throw err;
    });

    return res.send({data: results});
  });

  return router;
};
