import { Global, Module } from '@nestjs/common';
import * as Knex from 'knex';
import { KNEX_CONNECTION } from '../../common/utils/constants';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: KNEX_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        const knex = Knex(configService.get('database'));
        try {
          await knex.migrate.latest();
        } catch (error) {
          console.log('Failed to run migration due to', error);
        }
        return knex;
      },
      inject: [ConfigService],
    },
  ],
  exports: [KNEX_CONNECTION],
})
export class DatabaseModule {}
