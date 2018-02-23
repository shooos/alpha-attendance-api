const Router = require('express-promise-router');
const router = new Router();

module.exports = (accessor) => {
  router.post('/login', async (req, res) => {
    console.log(req.body);
    res.send(req.body);
  });

  return router;
};
