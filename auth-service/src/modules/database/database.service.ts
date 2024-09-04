import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { IDatabase } from './database.interface';
import { KNEX_CONNECTION } from '../../common/utils/constants';

@Injectable()
export class DatabaseService implements IDatabase {
  constructor(@Inject(KNEX_CONNECTION) private readonly knex: Knex) {}

  async migrateLatest(): Promise<void> {
    this.knex.migrate.latest();
  }

  async seedUp(): Promise<void> {
    this.knex.seed.run();
  }
}
