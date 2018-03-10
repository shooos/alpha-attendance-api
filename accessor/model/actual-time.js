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
      length: 16,
    },
    workPattern: {
      type: 'string',
      length: 32,
    },
    startTime: {
      type: 'time',
    },
    endTime: {
      type: 'time',
    },
    dutyHours: {
      type: 'hours',
    },
  }, commonInfo),
}
