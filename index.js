const express = require('express');
const app = express();

const Accessor = require('./accessor/postgres');
const attendanceAPI = require('./routes/attendance');
const userAPI = require('./routes/user');
const workPatternAPI = require('./routes/work-pattern');

const accessor = new Accessor({
  host: 'localhost',
  port: 5432,
  database: 'attendance',
  user: 'postgres',
  password: 'postgres',
});

attendanceAPI(app, accessor);
userAPI(app, accessor);
workPatternAPI(app, accessor);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(8080, () => {
  console.log('listen!');
});
