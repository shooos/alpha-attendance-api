const commonInfo = require('./common-info');

module.exports = {
  name: 'estimate_unclaimed_time',
  columns: Object.assign({
    id: {
      type: 'string',
      length: 16,
      notNull: true,
      key: true,
    },
    estimateTimeId: {
      type: 'string',
      length: 16,
      notNull: true,
      reference: {
        table: 'estimate_time',
        column: 'id',
      },
    },
    startTime: {
      type: 'time',
    },
    endTime: {
      type: 'time',
    },
  }, commonInfo),
}
