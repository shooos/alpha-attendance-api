const commonInfo = require('./common-info');

module.exports = {
  name: 'estimate_time',
  columns: Object.assign({
    memberId: {
      type: 'string',
      length: 16,
      notNull: true,
      key: true,
    },
    date: {
      type: 'date',
      notNull: true,
      key: true,
    },
    estimateId: {
      type: 'string',
      length: 16,
    },
    startTime: {
      type: 'time',
    },
    endTime: {
      type: 'time',
    },
  }, commonInfo),
}
