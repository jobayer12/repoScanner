import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  client: 'pg',
  connection: {
    host: process.env.DATABASE_CONNECTION_HOST,
    port: +process.env.DATABASE_CONNECTION_PORT,
    database: process.env.DBNAME,
    user: process.env.DATABASE_CONNECTION_USERNAME,
    password: process.env.DATABASE_CONNECTION_PASSWORD,
  },
  pool: {
    min: 10,
    max: 30,
    idleTimeoutMillis: 60000,
  },
  acquireConnectionTimeout: 20000,
  migrations: {
    enabled: (+process.env.DATABASE_MIGRATION_ENABLED || 0) > 0,
    tableName: process.env.DATABSE_MIGRATION_TABLE_NAME,
    directory: process.env.DATABASE_MIGRATION_DIR,
  },
  seeds: {
    enabled: (+process.env.DATABASE_SEED_ENABLED || 0) > 0,
    directory: process.env.DATABASE_SEED_DIR,
  },
}));
