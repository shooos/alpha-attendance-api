const commonInfo = require('./common-info');

module.exports = {
  name: 'actual_time',
  columns: Object.assign({
    id: {
      type: 'string',
      length: 16,
      notNull: true,
      key: true,
    },
    userCd: {
      type: 'string',
      notNull: true,
      length: 16,
    },
    date: {
      type: 'date',
      notNull: true,
    },
    workPattern: {
      type: 'string',
      length: 32,
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
  }, commonInfo),
}
