import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
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
  migrations: {
    directory: __dirname + '/../migrations',
    loadExtensions: ['.js'],
  },
}));
