module.exports = {
  name: 'member',
  columns: {
    memberId: {
      type: 'string',
      length: 16,
      key: true,
    },
    password: {
      type: 'string',
      length: 255,
      notNull: true,
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
    admin: {
      type: 'boolean',
      notNull: true,
    }
  },
}
