import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScanPayloadDto, ScanResponseDto, ScanSaveDto } from './dto/scan.dto';
import { GithubService } from '../github/github.service';
import { UserDto } from '../user/dto/user.dto';
import {
  IEmailGithubScan,
  IGithubScan,
  IGithubScanResult,
} from '../zeromq/interfaces/github-scan.interface';
import { ScannerPubService } from '../zeromq/scannerPub.service';
import { OnEvent } from '@nestjs/event-emitter';
import { ScanDao } from './scan.dao';
import { ScanResultDto } from './dto/scan-result.dto';
import { EmailPubService } from '../zeromq/emailPub.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScanService {
  constructor(
    private readonly githubService: GithubService,
    private readonly scannerPubService: ScannerPubService,
    private readonly scanDao: ScanDao,
    private readonly emailPubService: EmailPubService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
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
        userId: user.id,
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

  async scanById(id: string, session: UserDto): Promise<ScanResponseDto> {
    return this.scanDao.scanById(session.id, id);
  }

  @OnEvent('scan.github-scan-result')
  async saveScanResult(data: IGithubScanResult): Promise<boolean> {
    const payload = new ScanResultDto();
    payload.status = data.status;
    payload.result = data.result;
    try {
      const scanDetails = await this.scanDao.scanById(
        data.userId,
        data?.scanId,
      );
      if (!scanDetails) return false;
      const isUpdated = await this.scanDao.update(data.scanId, payload);
      if (isUpdated) {
        const user = await this.userService.userById(data.userId);
        console.log('user: ', user);
        if (user) {
          const emailPayloadData: IEmailGithubScan = {
            email: user.email,
            scanResultLink: `${this.configService.get('common.host')}:${this.configService.get('common.port')}/api/v1/scan/${data.scanId}`,
            status: data.status,
          };
          this.emailPubService
            .publishMessage('email.github-scan', emailPayloadData)
            .catch((error) => console.log(error));
        }
      }
      return isUpdated;
    } catch (e) {
      return false;
    }
  }
}
