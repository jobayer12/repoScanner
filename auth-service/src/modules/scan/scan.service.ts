import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScanPayloadDto, ScanSaveDto } from './dto/scan.dto';
import { GithubService } from '../github/github.service';
import { UserDto } from '../user/dto/user.dto';
import { IGithubScan } from '../zeromq/interfaces/github-scan.interface';
import { ScannerPubService } from '../zeromq/scannerPub.service';
import { OnEvent } from '@nestjs/event-emitter';
import { ScanDao } from './scan.dao';

@Injectable()
export class ScanService {
  constructor(
    private readonly githubService: GithubService,
    private readonly scannerPubService: ScannerPubService,
    private readonly scanDao: ScanDao,
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

    const scanSavePayload = new ScanSaveDto();
    scanSavePayload.userId = user.id;
    scanSavePayload.branch = payload.branch;
    scanSavePayload.repository = payload.repository;
    scanSavePayload.sha = branch.commit.sha;
    scanSavePayload.status = 'SCAN_STARTED';

    const scanId = await this.scanDao.save(scanSavePayload);
    if (scanId) {
      const githubScanPayload: IGithubScan = {
        sha: branch.commit.sha,
        branch: branch.name,
        repository: payload.repository,
        scanId,
      };

      try {
        await this.scannerPubService.publisherMessage(
          'scan.github-scan',
          githubScanPayload,
        );
      } catch (e) {
        throw new BadRequestException('Failed to publish message');
      }
    }

    return scanId;
  }

  @OnEvent('scan.github-scan-result')
  async saveScanResult(): Promise<string> {
    return '';
  }
}
