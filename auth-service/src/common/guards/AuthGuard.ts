import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserDto } from '../../modules/user/dto/user.dto';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject('LOGGED_IN_USER') private readonly _loggedInUser: UserDto,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    if (this._loggedInUser) {
      return true;
    }
    throw new UnauthorizedException('Invalid Auth Token');
  }
}
