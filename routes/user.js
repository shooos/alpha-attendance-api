const Router = require('express-promise-router');
const router = new Router();
const logger = require('../system/logger');
const InsertQuery = require('../accessor/sql/postgres/insert-query');
const SelectQuery = require('../accessor/sql/postgres/select-query');
const memberModel = require('../accessor/model/member');
const Authenticator = require('../system/authenticator');

module.exports = (accessor) => {
  const authenticator = new Authenticator(accessor);

  router.post('/register', async (req, res) => {
    const body = req.body;

    const selectQuery = new SelectQuery(memberModel);
    selectQuery.addCondition('AND', 'id', body.id);

    const members = await accessor.execute(selectQuery).catch((err) => {
      logger.error.error(err);
      return res.send({error: true, message: err});
    });
    const isExists = !!(members).length;
    if (isExists) {
      const msg = body.id + ' already exsists';
      logger.system.warn(msg);
      return res.send({error: true, message: msg});
    }

    const insertQuery = new InsertQuery(memberModel);
    insertQuery.appendValues({id: body.id, password: body.password});
    await accessor.execute(insertQuery).catch((err) => {
      logger.error.error(err);
      return res.send({error: true, message: err});
    });

    return res.send('Registerd.');
  });

  router.post('/login', async (req, res) => {
    const body = req.body;
    if (!body) return res.send({error: true, message: 'Who are you?'});

    await authenticator.login(body.id, body.password, body.host); // リクエスト元のホスト知りたいときはどうするの
    return res.send();
  });

  router.post('/logout', async (req, res) => {
    const body = req.body;
    if (!body) res.send({error: true, message: 'Who are you?'});

    await authenticator.logout(body.id, body.token, body.host);
    return res.send();
  });

  return router;
};
