const commonInfo = require('./common-info');

module.exports = Object.assign({
  id: {
    type: 'string',
    key: true,
  },
  actualTimeId: {
    type: 'string',
  },
  situation: {
    type: 'string',
  },
  subSituation: {
    type: 'string',
  },
  pCode: {
    type: 'string',
  },
  startTime: {
    type: 'time',
  },
  endTime: {
    type: 'time',
  },
}, commonInfo);
