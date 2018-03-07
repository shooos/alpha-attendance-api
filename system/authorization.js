const logger = require('../system/logger');
const Authenticator = require('../system/authenticator');

module.exports = function (accessor) {
  const authenticator = new Authenticator(accessor);

  return async (req, res, next) => {
    const auth = req.get('authorization');
    const client = req.header('x-forwarded-for') || req.connection.remoteAddress;

    if (!auth) {
      res.set('WWW-Authenticate', 'Bearer realm="Authorization Required"');
      return res.status(401).send({error: true, message: 'Authorization Required'});
    } else {
      const token = auth.split(' ').pop();
      const memberId = await authenticator.authenticate(token, client).catch((err) => {
        logger.error.error('Authentication Failure', err);
        return res.status(401).send({error: true, message: 'Authentication Failure'});
      });
      if (memberId == null) {
        return res.status(401).send({error: true, message: 'Authentication Failure'});
      }

      req.authUser = memberId;
    }
    next();
  };
}