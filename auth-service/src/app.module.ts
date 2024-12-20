import { Global, Module } from '@nestjs/common';
import { ScanModule } from './modules/scan/scan.module';
import { UserModule } from './modules/user/user.module';
import routes from './router';
import { RouterModule } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import DatabaseConfig from './config/database';
import RabbitMQConfig from './config/rabbitmq';
import CommonConfig from './config/common';
import JWTConfig from './config/jwt';
import { GithubModule } from './modules/github/github.module';
import { DatabaseModule } from './modules/database/database.module';
import { JwtModule } from './modules/jwt/jwt.module';
import LoggedInUser from './common/providers/loggedInUser';
import RedisConfig from './config/redis';
import { CacheModule } from './modules/cache/cache.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      isGlobal: true,
      load: [
        DatabaseConfig,
        RabbitMQConfig,
        CommonConfig,
        JWTConfig,
        RedisConfig,
      ],
    }),
    CacheModule,
    DatabaseModule,
    ScanModule,
    UserModule,
    GithubModule,
    JwtModule,
    RouterModule.register(routes),
  ],
  controllers: [],
  providers: [LoggedInUser],
  exports: ['LOGGED_IN_USER'],
})
export class AppModule {}
