const commonInfo = require('./common-info');

module.exports = {
  name: 'work_pattern',
  columns: Object.assign({
    workPatternId: {
      type: 'string',
      length: 16,
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
  }, commonInfo),
}
