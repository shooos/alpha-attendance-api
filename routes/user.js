const Router = require('express-promise-router');
const router = new Router();
const logger = require('../system/logger');
const InsertQuery = require('../accessor/sql/postgres/insert-query');
const SelectQuery = require('../accessor/sql/postgres/select-query');
const memberModel = require('../accessor/model/member');

module.exports = (accessor) => {
  router.post('/register', async (req, res) => {
    const body = req.body;

    const selectQuery = new SelectQuery(memberModel);
    selectQuery.addAndCondition({key: 'id', value: body.id});

    const members = await accessor.execute([selectQuery]).catch((err) => {
      logger.error.error(err);
      return res.send({error: true, message: err});
    });
    const isExists = !!(members)[0].length;
    if (isExists) {
      const msg = body.id + ' already exsists';
      logger.system.warn(msg);
      return res.send({error: true, message: msg});
    }

    const insertQuery = new InsertQuery(memberModel);
    insertQuery.appendValues({id: body.id, password: body.password});
    await accessor.execute([insertQuery]).catch((err) => {
      logger.error.error(err);
      return res.send({error: true, message: err});
    });

    return res.send('Registerd.');
  });

  router.post('/login', async (req, res) => {
    res.send(req.body);
  });

  return router;
};
