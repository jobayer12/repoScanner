import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScanPayloadDto, ScanResponseDto } from './dto/scan.dto';
import { GithubService } from '../github/github.service';
import { UserDto } from '../user/dto/user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { IGithubScan } from './interfaces/github-scan.interface';
import { mergeConfigObject } from '@nestjs/config/dist/utils/merge-configs.util';
import { timeout } from 'rxjs';

@Injectable()
export class ScanService {
  constructor(
    private readonly githubService: GithubService,
    @Inject('RMQ_SCAN_SERVICE') private readonly rabbitMQClient: ClientProxy,
    @Inject('RMQ_RPC') private readonly rabbitRpc: ClientProxy,
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

    if (!branch) {
      throw new NotFoundException(`Branch doesn't exists`);
    }

    try {
      const githubScanPayload: IGithubScan = {
        sha: branch.commit.sha,
        branch: branch.name,
        repository: payload.repository,
        userId: user.id,
        email: user.email,
      };
      await this.rabbitMQClient
        .emit('repo.scan.github', githubScanPayload)
        .toPromise();
      return 'Github repository Queued';
    } catch (error) {
      throw new BadRequestException('Failed to Queue github repository');
    }
  }

  async scanById(id: string, session: UserDto): Promise<ScanResponseDto> {
    const payload = {
      id,
      userId: session.id,
    };

    try {
      const response = await this.rabbitRpc
        .send('scanList', payload)
        .pipe(timeout(5000))
        .toPromise();
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    } catch (error) {
      throw new NotFoundException(
        error.message ?? 'Failed to load scan details',
      );
    }
  }
}
