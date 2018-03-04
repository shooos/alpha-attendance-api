const commonInfo = require('./common-info');

module.exports = {
  name: 'estimate_unclaimed_time',
  columns: Object.assign({
    estimateId: {
      type: 'string',
      length: 16,
      reference: {
        table: 'estimate_time',
        column: 'estimate_id',
      },
      key: true,
    },
    beginTime: {
      type: 'time',
      key: true,
    },
    finishTime: {
      type: 'time',
    },
  }, commonInfo),
}
