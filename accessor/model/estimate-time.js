const commonInfo = require('./common-info');

module.exports = {
  name: 'estimate_time',
  columns: Object.assign({
    id: {
      type: 'string',
      length: 16,
      key: true,
    },
    memberId: {
      type: 'string',
      length: 16,
      notNull: true,
    },
    date: {
      type: 'date',
      notNull: true,
    },
    startTime: {
      type: 'time',
    },
    endTime: {
      type: 'time',
    },
  }, commonInfo),
}
