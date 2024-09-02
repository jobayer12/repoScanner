import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { convertToApiUrl } from '../../common/utils/url.validate';
import { catchError, lastValueFrom, of, switchMap } from 'rxjs';
import { IGithubBranch, IGithubRepository } from './dto/github.repository';

@Injectable()
export class GithubService {
  constructor(private readonly httpService: HttpService) {}

  async repository(repository: string): Promise<IGithubRepository> {
    return lastValueFrom(
      this.httpService.get<IGithubRepository>(convertToApiUrl(repository)),
    )
      .catch((error) => {
        return {
          data: null,
        };
      })
      .then((response) => response.data);
  }

  async branch(repository: string, branch: string): Promise<IGithubBranch> {
    const url = `${convertToApiUrl(repository)}/branches/${branch}`;
    return lastValueFrom(this.httpService.get<IGithubBranch>(url))
      .catch((error) => {
        return {
          data: null,
        };
      })
      .then((response) => response.data);
  }
}
