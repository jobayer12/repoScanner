import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScanPayloadDto } from './dto/scan.dto';
import { GithubService } from '../github/github.service';
import { UserDto } from '../user/dto/user.dto';
import { IGithubScan } from '../zeromq/interfaces/github-scan.interface';
import { ZeromqService } from '../zeromq/zeromq.service';

@Injectable()
export class ScanService {
  constructor(
    private readonly githubService: GithubService,
    private readonly zeroMQService: ZeromqService,
  ) {}

  async scan(payload: ScanPayloadDto, user: UserDto): Promise<string> {
    const repository = await this.githubService.repository(payload?.repository);
    if (!repository) {
      throw new NotFoundException(`Repository doesn't exists`);
    }

    if (!payload?.branch) {
      payload.branch = repository.default_branch;
    }

    const branch = await this.githubService.branch(
      payload.repository,
      payload.branch,
    );

    if (!repository) {
      throw new NotFoundException(`Branch doesn't exists`);
    }

    const githubScanPayload: IGithubScan = {
      sha: branch.commit.sha,
      branch: branch.name,
      repository: payload.repository,
      user,
    };

    try {
      this.zeroMQService.publishScanQueue(
        'scan.github-scan',
        githubScanPayload,
      );
    } catch (e) {
      throw new BadRequestException('Failed to publish message');
    }
    return 'Repository scan started.';
  }
}
