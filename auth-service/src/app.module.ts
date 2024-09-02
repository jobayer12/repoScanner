import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScanModule } from './modules/scan/scan.module';
import { UserModule } from './modules/user/user.module';
import routes from './router';
import { RouterModule } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import DatabaseConfig from './config/database';
import ZeroMQConfig from './config/zeromq';
import CommonConfig from './config/common';
import JWTConfig from './config/jwt';
import { ZeromqModule } from './modules/zeromq/zeromq.module';
import { GithubModule } from './modules/github/github.module';
import { DatabaseModule } from './modules/database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      isGlobal: true,
      load: [DatabaseConfig, ZeroMQConfig, CommonConfig, JWTConfig],
    }),
    ScanModule,
    UserModule,
    GithubModule,
    ZeromqModule,
    DatabaseModule,
    RouterModule.register(routes),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
