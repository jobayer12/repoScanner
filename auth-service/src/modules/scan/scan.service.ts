import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ZeromqService } from '../zeromq/zeromq.service';
import { ScanPayloadDto } from './dto/scan.dto';
import { GithubService } from '../github/github.service';
import { ZeroMQPayload } from '../zeromq/dto/zeromq.payload';
import { ZeroMQTopic } from '../../common/enum/zeromq-topic.enum';

@Injectable()
export class ScanService {
  constructor(
    private readonly zeroMQService: ZeromqService,
    private readonly githubService: GithubService,
  ) {}

  async scan(payload: ScanPayloadDto): Promise<string> {
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

    const zeromqPayload: ZeroMQPayload = {
      sha: branch.commit.sha,
      branch: branch.name,
      repository: payload.repository,
    };

    try {
      await this.zeroMQService.publisherMessage(
        ZeroMQTopic.SCAN,
        JSON.stringify(zeromqPayload),
      );
    } catch (e) {
      throw new BadRequestException('Failed to publish message');
    }
    return 'Repository scan started.';
  }
}
