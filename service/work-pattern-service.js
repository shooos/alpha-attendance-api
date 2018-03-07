const createValuesObject = require('../accessor/util/create-values-object');
const MSG = require('../config/message/system-messages.json');

/* Queries */
const InsertQuery = require('../accessor/sql/postgres/insert-query');
const UpdateQuery = require('../accessor/sql/postgres/update-query');
const SelectQuery = require('../accessor/sql/postgres/select-query');

/* Models */
const workPatternModel = require('../accessor/model/work-pattern');
const workingHoursModel = require('../accessor/model/working-hours');

module.exports = async (accessor) => {
  const registerWorkPattern = async (data) => {
    const values = createValuesObject(data);

    // 一度更新を試みる
    const updateQuery = new UpdateQuery(workPatternModel);
    updateQuery.setUpdateValues(values);
    updateQuery.addCondition('work_pattern_id', data.workPatternId);
    const updateResult = await accessor.execute(updateQuery);

    if (updateResult.length === 0) {
      // 更新対象がなかったら挿入
      const insertQuery = new InsertQuery(workPatternModel);
      insertQuery.setValues(values);
      return await accessor.execute(insertQuery);
    } else {
      return updateResult;
    }
  }

  const getWorkPattern = async () => {

  }

  const registerWorkingHours = async () => {

  }

  const getWorkingHours = async () => {

  }

  return {
    registerWorkPattern: registerWorkPattern,
    getWorkPattern: getWorkPattern,
    registerWorkingHours: registerWorkingHours,
    getWorkingHours: getWorkingHours,
  }
}
