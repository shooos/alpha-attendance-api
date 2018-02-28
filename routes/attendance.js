const Router = require('express-promise-router');
const router = new Router();
const logger = require('../system/logger');
const Authenticator = require('../system/authenticator');
const InsertQuery = require('../accessor/sql/postgres/insert-query');
const UpdateQuery = require('../accessor/sql/postgres/update-query');
const SelectQuery = require('../accessor/sql/postgres/select-query');
const estimateTimeModel = require('../accessor/model/estimate-time');
const actualTimeModel = require('../accessor/model/actual-time');

module.exports = (accessor) => {
  const authenticator = new Authenticator(accessor);

  router.use(async (req, res, next) => {
    const auth = req.get('authorization');
    const client = req.header('x-forwarded-for') || req.connection.remoteAddress;

    if (!auth) {
      res.set('WWW-Authenticate', 'Bearer realm="Authorization Required"');
      return res.status(401).send({error: true, message: 'Authorization Required'});
    } else {
      const token = auth.split(' ').pop();
      const memberId = await authenticator.authenticate(token, client).catch((err) => {
        logger.error.error(err);
        return res.status(401).send({error: true, message: 'Authentication Failure'});
      });
      if (memberId == null) {
        return res.status(401).send({error: true, message: 'Authentication Failure'});
      }

      req.authUser = memberId;
    }
    next();
  });

  router.post('/estimate', async (req, res) => {
    return res.send();
  });

  router.get('/estimate', async (req, res) => {
    const selectQuery = new SelectQuery();
    return res.send();
  });

  router.post('/actual', async (req, res) => {
    return res.send();
  });

  router.get('/actual/:memberId', async (req, res) => {
    const selectQuery = new SelectQuery(actualTimeModel);
    selectQuery.addCondition('AND', 'member_id', req.params.memberId);

    const results = await accessor.execute(selectQuery);

    return res.send();
  });

  router.get('/actual/:memberId/:date', async (req, res) => {
    const selectQuery = new SelectQuery(actualTimeModel);
    selectQuery.addCondition('AND', '')
    return res.send();
  });

  return router;
};
