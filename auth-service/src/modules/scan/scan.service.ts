import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScanPayloadDto, ScanResponseDto } from './dto/scan.dto';
import { GithubService } from '../github/github.service';
import { UserDto } from '../user/dto/user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { IGithubScan } from './interfaces/github-scan.interface';

@Injectable()
export class ScanService {
  constructor(
    private readonly githubService: GithubService,
    @Inject('RMQ_SCAN_SERVICE') private readonly rabbitMQClient: ClientProxy,
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
      this.rabbitMQClient.emit('repo.scan.github', githubScanPayload);
      return 'Github repository Queued';
    } catch (error) {
      throw new BadRequestException('Failed to Queue github repository');
    }
  }

  async scanById(id: string, session: UserDto): Promise<ScanResponseDto> {
    return new ScanResponseDto();
    // const response = await this.scanDao.scanById(session.id, id);
    // if (!response) {
    //   throw new NotFoundException('Invalid scanId');
    // }
    // return response;
  }

  // @OnEvent('scan.github-scan-result')
  // async saveScanResult(data: IGithubScanResult): Promise<boolean> {
  //   const payload = new ScanResultDto();
  //   payload.status = data.status;
  //   payload.result = data.result;
  //   try {
  //     const scanDetails = await this.scanDao.scanById(
  //       data.userId,
  //       data?.scanId,
  //     );
  //     if (!scanDetails) return false;
  //     const isUpdated = await this.scanDao.update(data.scanId, payload);
  //     if (isUpdated) {
  //       const user = await this.userService.userById(data.userId);
  //       if (user) {
  //         const emailPayloadData: IEmailGithubScan = {
  //           email: user.email,
  //           scanResultLink: `${this.configService.get('common.host')}:${this.configService.get('common.port')}/api/v1/scan/${data.scanId}`,
  //           status: data.status,
  //         };
  //         this.emailPubService
  //           .publishMessage('email.github-scan', emailPayloadData)
  //           .catch((error) => console.log(error));
  //       }
  //     }
  //     return isUpdated;
  //   } catch (e) {
  //     return false;
  //   }
  // }
}
