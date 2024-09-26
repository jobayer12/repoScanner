import { Global, Module } from '@nestjs/common';
import { ScanService } from './scan.service';
import { ScanController } from './scan.controller';
import { ScanDao } from './scan.dao';

@Global()
@Module({
  controllers: [ScanController],
  providers: [ScanService, ScanDao],
})
export class ScanModule {}
