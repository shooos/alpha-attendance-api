const commonInfo = require('./common-info');

module.exports = {
  name: 'estimate_time',
  columns: Object.assign({
    estimateId: {
      type: 'string',
      length: 16,
      key: true,
    },
    memberId: {
      type: 'string',
      length: 16,
      notNull: true,
      unique: 'member_date',
    },
    date: {
      type: 'date',
      notNull: true,
      unique: 'member_date',
    },
    startTime: {
      type: 'time',
    },
    endTime: {
      type: 'time',
    },
  }, commonInfo),
}
