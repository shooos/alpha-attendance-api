const createTableUser = 'CREATE TABLE user (\
  user_cd VERCHAR(16) PRIMARY KEY,\
  password VERCHAR(255),\
  token VERCHAR(255)\
  );';

const createTableActualTime = 'CREATE TABLE actual_time (\
  id VERCHAR(16) PRIMARY KEY,\
  user_cd VERCHAR(16) REFERENCES user(user_cd),\
  date DATE,\
  work_pattern VERCHAR(32),\
  start_time TIME WITHOUT TIME ZONE,\
  end_time TIME WITHOUT TIME ZONE,\
  duty_hours INTERVAL HOUR TO MINUTE,\
  night_hours INTERVAL HOUR TO MINUTE,\
  semi_absence_hours INTERVAL HOUR TO MINUTE,\
  create_user VERCHAR(16),\
  create_date TIMESTAMP WITHOUT TIME ZONE,\
  update_user VERCHAR(16),\
  update_date TIMESTAMP WITHOUT TIME ZONE\
  );';

const createTableActualTimeDetail = 'CREATE TABLE actual_time_detail (\
  id VERCHAR(16) PRIMARY KEY,\
  actual_time_id VERCHAR(16) REFERENCES actual_time(id),\
  situation VERCHAR(32),\
  sub_situation VERCHAR(32),\
  p_code VERCHAR(16),\
  start_time TIME WITHOUT TIME ZONE,\
  end_time TIME WITHOUT TIME ZONE,\
  create_user VERCHAR(16),\
  create_date TIMESTAMP WITHOUT TIME ZONE,\
  update_user VERCHAR(16),\
  update_date TIMESTAMP WITHOUT TIME ZONE\
  );';

const createTableWorkPattern = 'CREATE TABLE work_pattern (\
  id VERCHAR(16) PRIMARY KEY,\
  start_working_time TIME WITHOUT TIME ZONE,\
  end_working_time TIME WITHOUT TIME ZONE,\
  start_standard_time TIME WITHOUT TIME ZONE,\
  end_standard_time TIME WITHOUT TIME ZONE,\
  start_core_time TIME WITHOUT TIME ZONE,\
  end_core_time TIME WITHOUT TIME ZONE,\
  start_before_core_time TIME WITHOUT TIME ZONE,\
  end_before_core_time TIME WITHOUT TIME ZONE,\
  create_user VERCHAR(16),\
  create_date TIMESTAMP WITHOUT TIME ZONE,\
  update_user VERCHAR(16),\
  update_date TIMESTAMP WITHOUT TIME ZONE\
  );'

const createTableWorkingHours = 'CREATE TABLE working_hours (\
  work_pattern_id VERCHAR(16) REFERENCES work_pattern(id),\
  start_time TIME WITHOUT TIME ZONE,\
  break_time BOOLEAN,\
  create_user VERCHAR(16),\
  create_date TIMESTAMP WITHOUT TIME ZONE,\
  update_user VERCHAR(16),\
  update_date TIMESTAMP WITHOUT TIME ZONE,\
  PRIMARY KEY(work_pattern_id, start_time)\
  );';

const createTableEstimateTime = 'CREATE TABLE estimate_time (\
  id VERCHAR(16) PRIMARY KEY,\
  user_cd VERCHAR(16) REFERENCES user(user_cd),\
  date DATE,\
  start_time TIME WITHOUT TIME ZONE,\
  end_time TIME WITHOUT TIME ZONE,\
  create_user VERCHAR(16),\
  create_date TIMESTAMP WITHOUT TIME ZONE,\
  update_user VERCHAR(16),\
  update_date TIMESTAMP WITHOUT TIME ZONE\
  );';

const createTableEstimateUnclaimedTime = 'CREATE TABLE estimate_unclaimed_time (\
  id VERCHAR(16) PRIMARY KEY,\
  estimate_time_id VERCHAR(16) REFERENCES estimate_time(id),\
  start_time TIME WITHOUT TIME ZONE,\
  end_time TIME WITHOUT TIME ZONE,\
  create_user VERCHAR(16),\
  create_date TIMESTAMP WITHOUT TIME ZONE,\
  update_user VERCHAR(16),\
  update_date TIMESTAMP WITHOUT TIME ZONE\
  );';

module.exports = {
  user: createTableUser,
  actualTime: createTableActualTime,
  actualTime_detail: createTableActualTimeDetail,
  workPattern: createTableWorkPattern,
  workingHours: createTableWorkingHours,
  estimateTime: createTableEstimateTime,
  estimateUnclaimedTime: createTableEstimateUnclaimedTime,
};
