const commonInfo = require('./common-info');

module.exports = Object.assign({
  id: {
    type: 'string',
    key: true,
  },
  startWorkingTime: {
    type: 'time',
  },
  endWorkingTime: {
    type: 'time',
  },
  startStandardTime: {
    type: 'time',
  },
  endStandardTime: {
    type: 'time',
  },
  startCoreTime: {
    type: 'time',
  },
  endCoreTime: {
    type: 'time',
  },
  startBeforeCoreTime: {
    type: 'time',
  },
  endBeforeCoreTime: {
    type: 'time',
  },
}, commonInfo);
