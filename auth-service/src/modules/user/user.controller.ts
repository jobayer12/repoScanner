import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreatePayload, UserLoginPayload } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from '../../common/interceptor/response.interceptor';
import { VerificationTokenDto } from './dto/verification-token.dto';
import { PasswordResetTypeEnum } from '../../common/enum/password-reset-type.enum';
import { ChangePasswordDto } from './dto/password-reset.dto';

@Controller('')
@ApiTags('user')
@UseInterceptors(ResponseInterceptor)
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

  @Get('verifyAccount/:verificationId')
  async verifyAccount(
    @Param('verificationId') verificationId: string,
  ): Promise<boolean> {
    return this.userService.verifyUserAccount(verificationId);
  }

  @Post('account-verification')
  async sendVerificationToken(
    @Body() payload: VerificationTokenDto,
  ): Promise<boolean> {
    return this.userService.accountVerification(payload);
  }

  @Post('reset-password')
  async resetPasssword(
    @Body() payload: VerificationTokenDto,
  ): Promise<boolean> {
    const userDetails = await this.userService.getUserByEmailAddress(
      payload.email,
    );
    if (!userDetails) {
      throw new NotFoundException(`Invalid email address`);
    }
    return this.userService.resetPassword(
      userDetails.id,
      PasswordResetTypeEnum.RESET_PASSWORD,
    );
  }

  @Post('change-password')
  async changePassword(@Body() payload: ChangePasswordDto): Promise<boolean> {
    return this.userService.changePassword(payload);
  }
}
