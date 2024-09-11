import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  providers: [CacheService],
  imports: [
    NestCacheModule.register({
      isGlobal: true,
    }),
  ],
  exports: [CacheService],
})
export class CacheModule {}
