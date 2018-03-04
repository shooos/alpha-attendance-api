const underscoreLowerToUpper = (match) => {
  return match.replace('_', '').toUpperCase();
}

module.exports = function (snake) {
  return snake.replace(/_[a-z]/g, underscoreLowerToUpper);
}