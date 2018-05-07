module.exports = {
  name: 'member',
  columns: {
    memberId: {
      type: 'string',
      length: 16,
      key: true,
    },
    token: {
      type: 'string',
      length: 255,
    },
    client: {
      type: 'string',
      length: 64,
    },
    authTime: {
      type: 'datetime',
    },
  },
}
