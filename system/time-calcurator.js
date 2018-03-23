const logger = require('../system/logger');

const format = (h, m) => {
  const hh = ('0' + h).slice(-2);
  const mm = ('0' + m).slice(-2);
  return [hh, mm].join(':');
}

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

  return format(Ahh - Bhh, Amm - Bmm);
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

  return format(Ahh + Bhh + up, mm);
}

/** 合計 */
const sum = (...args) => {
  if (!times) return '00:00';

  const times = [].concat(args);
  let sum = times.shift();
  for (let t of times) {
    sum = addition(sum, t);
  }

  return sum;
}

/** 最大値 */
const max = (...args) => {
  if (!args) return '00:00';

  const times = [].concat(args);
  let max = times.shift();
  for (let t of times) {
    max = compare(max, t) > 0 ? t : max;
  }

  return max;
}

/** 最小値 */
const min = (...args) => {
  if (!args) return '00:00';

  const times = [].concat(args);
  let min = times.shift();
  for (let t of times) {
    min = compare(min, t) < 0 ? t : min;
  }

  return min;
}

module.exports = {
  compare: compare,
  subtraction: subtraction,
  addition: addition,
  sum: sum,
  max: max,
  min: min,
}
