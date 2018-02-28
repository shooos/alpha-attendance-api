const upperToUnderscoreLower = (match) => {
  return '_' + match.toLowerCase();
}

module.exports = function (camel) {
  return camel.replace(/[A-Z]/g, upperToUnderscoreLower);
}
