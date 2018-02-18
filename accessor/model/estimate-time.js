const commonInfo = require('./common-info');

module.exports = Object.assign({
  id: {
    type: 'string',
    key: true,
  },
  userCd: {
    type: 'string',
  },
  date: {
    type: 'date',
  },
  startTime: {
    type: 'time',
  },
  endTime: {
    type: 'time',
  },
}, commonInfo);
