const commonInfo = require('./common-info')();

module.exports = function() {
  return Object.assign({
    id: {
      type: 'string',
      length: 16,
      notNull: true,
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
}
