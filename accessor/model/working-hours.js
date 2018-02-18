const commonInfo = require('./common-info');

module.exports = Object.assign({
  workPatternId: {
    type: 'string',
    key: true,
  },
  startTime: {
    type: 'time',
  },
  breakTime: {
    type: 'boolean',
  },
}, commonInfo);
