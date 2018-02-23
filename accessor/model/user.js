module.exports = {
  name: 'user',
  columns: {
    id: {
      type: 'string',
      length: 16,
      notNull: true,
      key: true,
    },
    password: {
      type: 'password',
      length: 255,
      notNull: true,
    },
    token: {
      type: 'token',
      length: 255,
    },
  },
}
