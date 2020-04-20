require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: `postgres://localhost/${process.env.DATABASE_NAME}`,
  },
  production: {
    client: 'pg',
    connection: `${process.env.DATABASE_URL}?ssl=true`,
  },
};
