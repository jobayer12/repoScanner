import { Global, Module } from '@nestjs/common';
import { ScanService } from './scan.service';
import { ScanController } from './scan.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  controllers: [ScanController],
  providers: [ScanService],
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RMQ_SCAN_SERVICE',
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('rabbitmq.url')],
            queue: configService.get<string>('rabbitmq.scanQueue'),
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
})
export class ScanModule {}
