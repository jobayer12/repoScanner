import { Global, Module } from '@nestjs/common';
import * as Knex from 'knex';
import { KNEX_CONNECTION } from '../../common/utils/constants';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: KNEX_CONNECTION,
      useFactory: (configService: ConfigService) => {
        return Knex(configService.get('database'));
      },
      inject: [ConfigService],
    },
  ],
  exports: [KNEX_CONNECTION],
})
export class DatabaseModule {}
