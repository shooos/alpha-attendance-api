const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('./system/logger');
const app = express();

/* Config */
const systemConf = require('./config/system-config.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(logger.express);

const Accessor = require('./accessor/postgres');
const attendanceAPI = require('./routes/attendance');
const userAPI = require('./routes/user');
const workPatternAPI = require('./routes/work-pattern');

const accessor = new Accessor();

accessor.initialize()
.then(async () => {
  app.head('/alpha', (req, res) => {
    return res.send('ok');
  });

  app.use('/alpha/user', userAPI(accessor));
  app.use('/alpha/attendance', attendanceAPI(accessor));
  app.use('/alpha/workPattern', workPatternAPI(accessor));

  app.listen(systemConf.port || 3000, () => {
    logger.system.info('ｷﾀ━(ﾟ∀ﾟ)━!! STARTUP COMPLETE! Alpha Attendance APIs');
  });
})
.catch((err) => {
  logger.error.error('(´･ω･`) STARTUP FAILED...orz', err);
  throw err;
});
