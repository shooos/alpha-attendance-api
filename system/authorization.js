const logger = require('../system/logger');
const Authenticator = require('../system/authenticator');

module.exports = function (accessor) {
  const authenticator = new Authenticator(accessor);

  return async (req, res, next) => {
    const auth = req.get('authorization');
    const client = req.header('x-forwarded-for') || req.connection.remoteAddress;

    if (!auth) {
      logger.error.error('AuthorizationRequired');
      res.set('WWW-Authenticate', 'Bearer realm="Authorization Required"');
      return res.status(401).send({error: 'AuthorizationRequired', message: 'Authorization required.'});
    } else {
      const token = auth.split(' ').pop();
      const member = await authenticator.authenticate(token, client)
      .catch((err) => {
        logger.error.error('Authentication Failure', err);
        res.status(401).send({error: err.name, message: err.message});
        throw err;
      });

      if (member.memberId == null) {
        return res.status(401).send({
          error: 'AuthorizationRequired',
          message: 'Authentication failure.'
        });
      }

      req.authUser = member.memberId;
    }
    next();
  };
}