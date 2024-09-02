import { Global, Module } from '@nestjs/common';
import { ScanService } from './scan.service';
import { ScanController } from './scan.controller';

@Global()
@Module({
  controllers: [ScanController],
  providers: [ScanService],
})
export class ScanModule {}
