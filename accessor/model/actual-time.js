const commonInfo = require('./common-info');

module.exports = {
  name: 'actual_time',
  columns: Object.assign({
    memberId: {
      type: 'string',
      notNull: true,
      length: 16,
      key: true,
    },
    date: {
      type: 'date',
      notNull: true,
      key: true,
    },
    actualId: {
      type: 'string',
      length: 32,
    },
    workPatternId: {
      type: 'string',
      length: 16,
    },
    startTime: {
      type: 'time',
    },
    endTime: {
      type: 'time',
    },
    dutyHours: {
      type: 'hours',
      notNull: true,
    },
  }, commonInfo),
}
