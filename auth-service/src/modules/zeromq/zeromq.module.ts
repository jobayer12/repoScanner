import { Global, Module } from '@nestjs/common';
import { EmailPubService } from './emailPub.service';
import {ScannerPubService} from './scannerPub.service';
import {ScannerSubService} from './scannerSub.service';

@Global()
@Module({
  providers: [EmailPubService, ScannerPubService, ScannerSubService],
  exports: [EmailPubService, ScannerPubService, ScannerSubService],
})
export class ZeromqModule {}
