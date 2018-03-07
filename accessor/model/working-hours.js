const commonInfo = require('./common-info');

module.exports = {
  name: 'working_hours',
  columns: Object.assign({
    workPatternId: {
      type: 'string',
      length: 16,
      key: true,
      reference: {
        table: 'work_pattern',
        column: 'work_pattern_id',
      },
    },
    startTime: {
      type: 'time',
      key: true,
    },
    breakTime: {
      type: 'boolean',
    },
  }, commonInfo),
}
