import { Module } from '@nestjs/common';
import ZeroMQ from './config/ZeroMQ';
import { ConfigModule } from '@nestjs/config';
import Mail from './config/Mail';
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      isGlobal: true,
      load: [ZeroMQ, Mail],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
