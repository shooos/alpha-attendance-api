const express = require('express');
const bodyParser = require('body-parser');
const logger = require('./system/logger');
const app = express();

app.use(bodyParser.json());
app.use(logger.express);

const Accessor = require('./accessor/postgres');
const attendanceAPI = require('./routes/attendance');
const userAPI = require('./routes/user');
const workPatternAPI = require('./routes/work-pattern');

const accessor = new Accessor();

accessor.initialize()
.then(() => {
  app.use('/attendance', attendanceAPI(accessor));
  app.use('/user', userAPI(accessor));
  app.use('/workPattern', workPatternAPI(accessor));

  app.listen(8080, () => {
    logger.system.info('ｷﾀ━(ﾟ∀ﾟ)━!! STARTUP COMPLETE! Alpha Attendance APIs');
  });
})
.catch((err) => {
  logger.error.error('(´･ω･`) STARTUP FAILED...orz', err);
  throw err;
});
