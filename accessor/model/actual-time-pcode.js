const commonInfo = require('./common-info');

module.exports = {
  name: 'actual_time_pcode',
  columns: Object.assign({
    actualId: {
      type: 'string',
      length: 16,
      key: true,
    },
    pCode: {
      type: 'string',
      length: 64,
      key: true,
    },
    dutyHours: {
      type: 'hours',
    },
  }, commonInfo),
}
