const Router = require('express-promise-router');
const router = new Router();
const logger = require('../system/logger');
const Authenticator = require('../system/authenticator');
const MSG = require('../config/message/system-messages.json');

/* Models */
const memberModel = require('../accessor/model/member');

module.exports = (accessor) => {
  const authenticator = new Authenticator(accessor);

  /** メンバ登録・ログイン */
  router.post('/', async (req, res) => {
    const body = req.body;
    if (!body) {
      logger.error.error(MSG.BODY_PARAMS_REQUIRED);
      res.send({error: 'IllegalParameterError', message: MSG.BODY_PARAMS_REQUIRED});
      throw new Error(MSG.BODY_PARAMS_REQUIRED);
    }

    const result = await authenticator.login(body.id, false)
    .catch((err) => {
      logger.error.error(err);
      res.send({error: 'SignInError', message: err.message});
      throw err;
    });

    return res.send({data: {
      memberId: result.memberId,
      token: result.token
    }});
  });

  return router;
};
