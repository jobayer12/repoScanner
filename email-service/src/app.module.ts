import { Module } from '@nestjs/common';
import RabbitMQ from './config/rabbitmq';
import { ConfigModule } from '@nestjs/config';
import Mail from './config/Mail';
import { MailModule } from './modules/mail/mail.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      cache: true,
      isGlobal: true,
      load: [RabbitMQ, Mail],
    }),
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
