const commonInfo = require('./common-info');

module.exports = {
  name: 'actual_time',
  columns: Object.assign({
    actualId: {
      type: 'string',
      length: 16,
      key: true,
    },
    memberId: {
      type: 'string',
      notNull: true,
      length: 16,
      unique: 'member_date',
    },
    date: {
      type: 'date',
      notNull: true,
      unique: 'member_date',
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
