const commonInfo = require('./common-info');

module.exports = {
  name: 'actual_time_detail',
  columns: Object.assign({
    actualId: {
      type: 'string',
      length: 16,
      key: true,
    },
    beginTime: {
      type: 'time',
      key: true,
    },
    finishTime: {
      type: 'time',
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
  }, commonInfo),
}
