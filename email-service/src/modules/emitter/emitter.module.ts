import { Global, Module } from '@nestjs/common';
import { EmitterService } from './emitter.service';

@Global()
@Module({
  providers: [EmitterService],
  exports: [EmitterService],
})
export class EmitterModule {}
