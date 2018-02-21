const commonInfo = require('./common-info')();

module.exports = function(estimateTime) {
  return Object.assign({
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
      reference: estimateTime.id,
    },
    startTime: {
      type: 'time',
    },
    endTime: {
      type: 'time',
    },
  }, commonInfo);
}
