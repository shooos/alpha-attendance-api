const express = require('express');
const app = express();

const Accessor = require('./accessor/postgres');
const attendanceAPI = require('./routes/attendance');
const userAPI = require('./routes/user');

const accessor = new Accessor({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
});

attendanceAPI(app, accessor);
userAPI(app, accessor);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(8080, () => {
  console.log('listen!');
});
