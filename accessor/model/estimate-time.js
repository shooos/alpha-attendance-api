const commonInfo = require('./common-info')();

module.exports = function() {
  return Object.assign({
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
  }, commonInfo);
}
