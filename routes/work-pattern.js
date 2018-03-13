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
      return res.send({error: true, message: MSG.BODY_PARAMS_REQUIRED});
    }

    await workPatternService.registerWorkPattern(req.authUser, body)
      .catch((err) => {
        logger.error.error('Register work pattern faild.', err);
        return res.send({error: true, message: 'Register work pattern faild.'});
      });

    res.send({token: req.newToken, data: {}});
  });

  return router;
};
