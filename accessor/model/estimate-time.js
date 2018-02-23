const commonInfo = require('./common-info');

module.exports = {
  name: 'estimate_time',
  columns: Object.assign({
    id: {
      type: 'string',
      notNull: true,
      key: true,
    },
    userCd: {
      type: 'string',
      length: 16,
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
