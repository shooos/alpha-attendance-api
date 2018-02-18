const commonInfo = require('./common-info');

module.exports = Object.assign({
  id: {
    type: 'string',
    key: true,
  },
  userCd: {
    type: 'string',
  },
  date: {
    type: 'date',
  },
  workPattern: {
    type: 'string',
  },
  startTime: {
    type: 'time',
  },
  endTime: {
    type: 'time',
  },
  dutyHours: {
    type: 'hours',
  },
  nightHours: {
    type: 'hours',
  },
  semiAbsenceHours: {
    type: 'hours',
  },
}, commonInfo);
