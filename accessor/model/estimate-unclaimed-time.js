const commonInfo = require('./common-info');

module.exports = Object.assign({
  id: {
    type: 'string',
    key: true,
  },
  estimateTimeId: {
    type: 'string',
  },
  startTime: {
    type: 'time',
  },
  endTime: {
    type: 'time',
  },
}, commonInfo);
