const commonInfo = require('./common-info')();

module.exports = function(actualTime) {
  return Object.assign({
    id: {
      type: 'string',
      length: 16,
      notNull: true,
      key: true,
    },
    actualTimeId: {
      type: 'string',
      length: 16,
      notNull: true,
      reference: actualTime.id,
    },
    situation: {
      type: 'string',
      length: 32,
    },
    subSituation: {
      type: 'string',
      length: 32,
    },
    pCode: {
      type: 'string',
      length: 16,
    },
    startTime: {
      type: 'time',
    },
    endTime: {
      type: 'time',
    },
  }, commonInfo);
}