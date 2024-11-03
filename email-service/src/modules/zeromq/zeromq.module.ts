import { Global, Module } from '@nestjs/common';
import { AuthServiceSubService } from './authServiceSub.service';

@Global()
@Module({
  providers: [AuthServiceSubService],
  exports: [AuthServiceSubService],
})
export class ZeromqModule {}
