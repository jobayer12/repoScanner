import { Injectable, Scope } from '@nestjs/common';
import { IDatabase } from './database.interface';
import knex, { Knex } from 'knex';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.DEFAULT })
export class DatabaseService implements IDatabase<Knex> {
  private _connection: Knex;

  constructor(private readonly configurationService: ConfigService) {}

  async connection(): Promise<Knex> {
    if (!this._connection) {
      this._connection = knex({
        client: this.configurationService.get('database.client'),
        connection: {
          host: this.configurationService.get('database.connection.host'),
          port: this.configurationService.get('database.connection.port'),
          database: this.configurationService.get(
            'database.connection.database',
          ),
          user: this.configurationService.get('database.connection.user'),
          password: this.configurationService.get(
            'database.connection.password',
          ),
        },
        pool: {
          min: this.configurationService.get('database.pool.min'),
          max: this.configurationService.get('database.pool.max'),
          idleTimeoutMillis: this.configurationService.get(
            'database.pool.idleTimeoutMillis',
          ),
        },
        acquireConnectionTimeout: this.configurationService.get(
          'database.acquireConnectionTimeout',
        ),
        migrations: {
          tableName: this.configurationService.get(
            'database.migrations.tableName',
          ),
          directory:
            this.configurationService.get('common.baseDir') +
            this.configurationService.get('database.migrations.directory'),
          loadExtensions: ['.js'],
        },
        seeds: {
          directory:
            this.configurationService.get('common.base.directory') +
            this.configurationService.get('database.seeds.directory'),
          loadExtensions: ['.js'],
        },
      });
    }
    return this._connection;
  }

  async migrations(): Promise<void> {
    return null;
  }

  seeds(): Promise<void> {
    return null;
  }
}
