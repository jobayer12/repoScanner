import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreatePayload, UserLoginPayload } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('login')
  async login(@Body() payload: UserLoginPayload): Promise<string> {
    return this.userService.login(payload);
  }

  @Post('singup')
  async createAccount(@Body() payload: UserCreatePayload): Promise<number> {
    return this.userService.createAccount(payload);
  }
}
