const logger = require('../system/logger');

/**
 * 比較
 * a < b : 1
 * a = b : 0
 * a > b : -1
 */
const compare = (a, b) => {
  logger.system.debug('time-calcurator#compare', a, b);

  const A = a.split(':');
  const B = b.split(':');

  const Amm = A.pop() - 0;
  const Ahh = A.pop() - 0;
  const Bmm = B.pop() - 0;
  const Bhh = B.pop() - 0;

  const hhD = Bhh - Ahh;
  let result = 0;
  if (hhD !== 0) {
    result = hhD / Math.abs(hhD);
    return result;
  }

  const mmD = Bmm - Amm;
  if (mmD !== 0) {
    result = mmD / Math.abs(mmD);
  }
  return result;
}

/** 差分 */
const subtraction = (a, b) => {
  logger.system.debug('time-calcurator#timeSubtraction', a, b);

  const A = a.split(':');
  const B = b.split(':');

  let Amm = A.pop() - 0;
  let Ahh = A.pop() - 0;
  const Bmm = B.pop() - 0;
  const Bhh = B.pop() - 0;

  if (Amm < Bmm) {
    // 桁借り
    Ahh--;
    Amm += 60;
  }

  const mm = Amm - Bmm;
  const hh = Ahh - Bhh;

  return [hh, mm].join(':');
}

/** 加算 */
const addition = (a, b) => {
  logger.system.debug('time-calcurator#timeAddition', a, b);

  const A = a.split(':');
  const B = b.split(':');

  const Amm = A.pop() - 0;
  const Ahh = A.pop() - 0;
  const Bmm = B.pop() - 0;
  const Bhh = B.pop() - 0;

  let mm = Amm + Bmm;
  let up = 0;
  if (mm >= 60) {
    // 桁上がり
    up = Math.floor(mm / 60);
    mm %= 60;
  }
  const hh = Ahh + Bhh + up;

  return [hh, mm].join(':');
}

/** 合計 */
const sum = (times) => {
  logger.system.debug('time-calcurator#sum', times);

  if (times == null) return '00:00';

  let sum = '00:00';
  for (let time of times) {
    sum = addition(sum, time);
  }

  return sum;
}

module.exports = {
  compare: compare,
  subtraction: subtraction,
  addition: addition,
  sum: sum,
}