const Router = require('express-promise-router');
const router = new Router();
const authorization = require('../system/authorization');
const logger = require('../system/logger');

module.exports = (accessor) => {
  const workPatternService = require('../service/work-pattern-service')(accessor);

  /** 認証 */
  router.use(authorization(accessor));

  /** 勤務形態登録 */
  router.post('/register', async (req, res) => {
    const body = req.body;
    if (!body) {
      logger.error.error(MSG.BODY_PARAMS_REQUIRED);
      res.send({error: true, message: MSG.BODY_PARAMS_REQUIRED});
      throw new Error(MSG.BODY_PARAMS_REQUIRED);
    }

    await workPatternService.registerWorkPattern(req.authUser, body)
      .catch((err) => {
        logger.error.error('Register work pattern faild.', err);
        res.send({error: err.name, message: 'Register work pattern faild.'});
        throw err;
      });

    return res.send({data: true});
  });

  /** 勤務形態取得 */
  router.get('/id/:workPatternId', async (req, res) => {
    const id = req.params.workPatternId;
    const result = await workPatternService.getWorkPattern(id);
    return res.send({data: result});
  });

  /** 勤務形態リスト取得 */
  router.get('/list', async (req, res) => {
    const patterns = await workPatternService.getWorkPatterns()
      .catch((err) => {
        logger.error.error(err);
        res.send({error: err.name, message: err.message});
        throw err;
      });

    return res.send({data: patterns});
  });

  return router;
};
