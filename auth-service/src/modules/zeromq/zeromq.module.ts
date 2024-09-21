import { Global, Module } from '@nestjs/common';
import { ZeromqService } from './zeromq.service';
import { ZeromqScanService } from './zeromq-scan.service';

@Global()
@Module({
  providers: [ZeromqService, ZeromqScanService],
  exports: [ZeromqService, ZeromqScanService],
})
export class ZeromqModule {}
