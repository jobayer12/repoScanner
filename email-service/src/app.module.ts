import { Module } from '@nestjs/common';
import ZeroMQ from './config/ZeroMQ';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      isGlobal: true,
      load: [ZeroMQ],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
