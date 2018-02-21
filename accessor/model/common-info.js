module.exports = function() {
  return {
    createUser: {
      type: 'string',
      length: 16,
    },
    createDate: {
      type: 'datetime',
    },
    updateUser: {
      type: 'string',
      length: 16,
    },
    updateDate: {
      type: 'datetime',
    },
  };
}
