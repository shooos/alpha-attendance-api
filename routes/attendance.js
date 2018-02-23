const Router = require('express-promise-router');
const router = new Router();

module.exports = (accessor) => {
  router.post('/actualTime', async (req, res) => {
    const result = await accessor.select();
    res.send(result);
  });

  router.get('/actualTime', async (req, res) => {

  });

  return router;
};
