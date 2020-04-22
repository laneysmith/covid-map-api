require('dotenv').config();

module.exports = {
  test: {
    client: 'pg',
    connection: `postgres://localhost/${process.env.DATABASE_NAME}_test`,
    migrations: {
      directory: __dirname + '/db/migrations',
    },
    seeds: {
      directory: __dirname + '/db/seeds/test',
    },
  },
  development: {
    client: 'pg',
    connection: `postgres://localhost/${process.env.DATABASE_NAME}`,
    migrations: {
      directory: __dirname + '/db/migrations',
    },
  },
  production: {
    client: 'pg',
    connection: `${process.env.DATABASE_URL}?ssl=true`,
    migrations: {
      directory: __dirname + '/db/migrations',
    },
  },
};
