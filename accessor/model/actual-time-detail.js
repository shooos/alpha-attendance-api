const commonInfo = require('./common-info');

module.exports = {
  name: 'actual_time_detail',
  columns: Object.assign({
    id: {
      type: 'string',
      length: 16,
      key: true,
    },
    actualTimeId: {
      type: 'string',
      length: 16,
      reference: {
        table: 'actual_time',
        column: 'id',
      },
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
  }, commonInfo),
}
