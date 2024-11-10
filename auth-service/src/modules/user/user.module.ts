import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserDao } from './user.dao';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
@Global()
@Module({
  providers: [UserService, UserDao],
  controllers: [UserController],
  imports: [
    JwtModule,
    ClientsModule.registerAsync([
      {
        name: 'RMQ_EMAIL_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url')],
            queue: configService.get<string>('rabbitmq.emailQueue'),
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  exports: [UserService],
})
export class UserModule {}
