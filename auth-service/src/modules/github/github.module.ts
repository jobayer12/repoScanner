import { Global, Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  providers: [GithubService],
  exports: [GithubService],
  imports: [HttpModule],
})
export class GithubModule {}
