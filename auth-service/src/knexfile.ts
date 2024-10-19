const knex = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  pool: {
    min: 10,
    max: 30,
    idleTimeoutMillis: 60000,
  },
  acquireConnectionTimeout: 20000,
  ssl: (+process.env.DATABASE_SSL || 0) > 0,
  migrations: {
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
};

export default knex;
