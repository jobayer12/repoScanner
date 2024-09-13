import { UserDto } from '../../../modules/user/dto/user.dto';

export interface IGithubScan {
  sha: string;
  branch: string;
  repository: string;
  user: UserDto;
}
