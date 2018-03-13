const Router = require('express-promise-router');
const router = new Router();
const logger = require('../system/logger');
const authorization = require('../system/authorization');
const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');

module.exports = (accessor) => {
  const actualService = require('../service/actual-time-service')(accessor);

  /** 認証 */
  router.use(authorization(accessor));

  /** 稼働予定登録・更新 */
  router.post('/estimate', async (req, res) => {
    const body = req.body;
    if (!body) {
      logger.error.error(MSG.BODY_PARAMS_REQUIRED);
      return res.send({error: true, message: MSG.BODY_PARAMS_REQUIRED, token: req.newToken});
    }

    const authUser = req.authUser;
    if (authUser !== body.memberId) {
      logger.error.error(MSG.UPDATE_NOT_PERMITTED);
      return res.send({error: true, message: MSG.UPDATE_NOT_PERMITTED, token: req.newToken});
    }

    return res.send({token: req.newToken, data: true});
  });

  /** 稼働予定一覧取得（年月指定） */
  router.get('/estimates/:memberId/:year?/:month?', async (req, res) => {
    if (req.authUser !== req.params.memberId) {
      logger.error.error(MSG.SELECT_NOT_PERMITTED);
      return res.send({error: true, message: MSG.SELECT_NOT_PERMITTED, token: req.newToken});
    }

    const current = new Date();
    const year = req.params.year || (current.getFullYear());
    const month = req.params.month || (current.getMonth() + 1);

    return res.send({token: req.newToken, data: results});
  });

  /** 稼働予定1件取得（日付指定） */
  router.get('/estimate/:memberId/:date?', async (req, res) => {
    if (req.authUser !== req.params.memberId) {
      logger.error.error(MSG.SELECT_NOT_PERMITTED);
      return res.send({error: true, message: MSG.SELECT_NOT_PERMITTED, token: req.newToken});
    }

    const date = new Date() || req.params.date;

    return res.send({token: req.newToken, data: results[0]});
  });

  /** 稼働実績登録・更新 */
  router.post('/actual', async (req, res) => {
    const body = req.body;
    if (!body) {
      logger.error.error(MSG.BODY_PARAMS_REQUIRED);
      return res.send({error: true, message: MSG.BODY_PARAMS_REQUIRED, token: req.newToken});
    }
    if (!Array.isArray(body.detail)) {
      logger.error.error('Parameter [detail] is required');
      return res.send({error: true, message: 'Parameter [detail] is required', token: req.newToken});
    }

    const authUser = req.authUser;
    if (authUser !== body.memberId) {
      logger.error.error(MSG.UPDATE_NOT_PERMITTED);
      return res.send({error: true, message: MSG.UPDATE_NOT_PERMITTED, token: req.newToken});
    }

    const record = await actualService.getActualTime(body.memberId, {
      date: body.date,
    });
    const actualId = await actualService.registerActualTime(authUser, {
      memberId: body.memberId,
      date: body.date,
      actualId: record.length ? record[0].actual_id : null,
      workPattern: body.workPattern,
      detail: body.detail,
    });

    return res.send({token: req.newToken, data: {
      actualId: actualId,
    }});
  });

  /** 稼働実績一覧取得（年月指定） */
  router.get('/actuals/:memberId/:year?/:month?', async (req, res) => {
    if (req.authUser !== req.params.memberId) {
      logger.error.error(MSG.SELECT_NOT_PERMITTED);
      return res.send({error: true, message: MSG.SELECT_NOT_PERMITTED, token: req.newToken});
    }

    const current = new Date();
    const results = await actualService.getActualTime(req.authUser, {
      year: req.params.year || (current.getFullYear()),
      month: req.params.month || (current.getMonth() + 1),
    });
    return res.send({token: req.newToken, data: results});
  });

  /** 稼働実績1件取得（日時指定） */
  router.get('/actual/:memberId/:date?', async (req, res) => {
    if (req.authUser !== req.params.memberId) {
      logger.error.error(MSG.SELECT_NOT_PERMITTED);
      return res.send({error: true, message: MSG.SELECT_NOT_PERMITTED, token: req.newToken});
    }

    const results = await actualService.getActualTime(req.authUser, {
      date: req.params.date || new Date(),
    });
    return res.send({token: req.newToken, data: results[0]});
  });

  return router;
};
