import { Module } from '@nestjs/common';
import ZeroMQ from './config/ZeroMQ';
import { ConfigModule } from '@nestjs/config';
import Mail from './config/Mail';
import { MailModule } from './modules/mail/mail.module';
import { ZeromqModule } from './modules/zeromq/zeromq.module';
import { EmitterModule } from './modules/emitter/emitter.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      isGlobal: true,
      load: [ZeroMQ, Mail],
    }),
    EventEmitterModule.forRoot(),
    EmitterModule,
    ZeromqModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
