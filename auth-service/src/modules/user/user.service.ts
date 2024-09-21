import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDao } from './user.dao';
import { UserCreatePayload, UserDto, UserLoginPayload } from './dto/user.dto';
import { JwtService } from '../jwt/jwt.service';
import * as bcrypt from 'bcryptjs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ChangePasswordDto, PasswordResetDto } from './dto/password-reset.dto';
import { nanoid } from 'nanoid';
import { PasswordResetTypeEnum } from 'src/common/enum/password-reset-type.enum';
import { VerificationTokenDto } from './dto/verification-token.dto';
import { CacheService } from '../cache/cache.service';
import { ONE_DAY } from '../../common/utils/constants';
import { ConfigService } from '@nestjs/config';
import { ZeromqService } from '../zeromq/zeromq.service';
import { IPasswordReset } from '../zeromq/interfaces/password-reset.interface';
import { IVerifyEmail } from '../zeromq/interfaces/verify-email.interface';

@Injectable()
export class UserService {
  constructor(
    private readonly userDao: UserDao,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
    private readonly zeroMQService: ZeromqService,
    private readonly configService: ConfigService,
  ) {}

  async createAccount(user: UserCreatePayload): Promise<number> {
    const userDetails = await this.getUserByEmailAddress(user.email);
    if (userDetails) {
      throw new NotAcceptableException('Email already exists');
    }
    user.password = bcrypt.hashSync(user.password);
    const userId = await this.userDao.create(user);
    if (userId > 0) {
      this.resetPassword(userId, PasswordResetTypeEnum.VERIFY_ACCOUNT).catch(
        (error) => {
          console.error(error);
        },
      );
    }
    return userId;
  }

  async login(user: UserLoginPayload): Promise<string> {
    const userDetails = await this.getUserByEmailAddress(user.email);
    if (!userDetails) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (userDetails && !userDetails.isVerified) {
      throw new UnauthorizedException(`User isn't verified.`);
    }

    const isPasswordValid = bcrypt.compareSync(
      user.password,
      userDetails.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    const tokenPayload: Record<string, any> = {
      id: userDetails.id,
      firstName: userDetails.firstName,
      lastName: userDetails.lastName,
      email: userDetails.email,
      isVerified: userDetails.isVerified,
    };

    return this.jwtService.getToken(tokenPayload);
  }

  async userById(userId: number): Promise<UserDto> {
    return this.userDao.userById(userId);
  }

  async resetPassword(
    userId: number,
    type: PasswordResetTypeEnum,
  ): Promise<boolean> {
    const payload = new PasswordResetDto();
    payload.userId = userId;
    payload.type = type;
    payload.token = nanoid();
    try {
      const response = await this.userDao.resetPassword(payload);
      if (response.length > 0) {
        const user = await this.userById(response[0].userId);
        if (user) {
          if (response[0].type === PasswordResetTypeEnum.RESET_PASSWORD) {
            const payload: IPasswordReset = {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              resetLink: `${this.configService.get('common.host')}:${this.configService.get('common.port')}/api/v1/user/reset-password`,
              token: response[0].token,
            };
            try {
              await this.zeroMQService.publisherEmailQueue(
                'email.password-reset',
                payload,
              );
            } catch (error) {
              console.error('Faile to publish email message');
            }
          } else if (
            response[0].type === PasswordResetTypeEnum.VERIFY_ACCOUNT
          ) {
            const payload: IVerifyEmail = {
              firstName: user.firstName,
              lastName: user.lastName,
              token: response[0].token,
              email: user.email,
              verificationLink: `${this.configService.get('common.host')}:${this.configService.get('port')}/api/v1/user/verifyAccount/${response[0].token}`,
            };
            try {
              await this.zeroMQService.publisherEmailQueue(
                  'email.email-verify',
                  payload,
              );
            } catch (e) {
              console.error('Faile to publish email message');
            }
          }
        }
      }
      return response.length > 0;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }

  async updateUserAccount(userId: number, user: UserDto): Promise<boolean> {
    if (user.password) {
      user.password = bcrypt.hashSync(user.password);
    }
    return this.userDao.updateUserAccount(userId, user);
  }

  async resetPasswordDetailsByToken(
    token: string,
    type: PasswordResetTypeEnum,
  ): Promise<PasswordResetDto> {
    return this.userDao.resetPasswordDetails(token, type);
  }

  async verifyUserAccount(verificationId: string): Promise<boolean> {
    const resetPasswordDetails = await this.resetPasswordDetailsByToken(
      verificationId,
      PasswordResetTypeEnum.VERIFY_ACCOUNT,
    );
    if (!resetPasswordDetails || resetPasswordDetails.isUsed) {
      throw new NotFoundException('Invalid token');
    }
    const userDto = new UserDto();
    userDto.isVerified = true;
    const userUpdateDetails = await this.userDao.updateUserAccount(
      resetPasswordDetails.userId,
      userDto,
    );
    if (!userUpdateDetails) {
      return userUpdateDetails;
    }
    return this.userDao.updateResetPasswordDetails(
      resetPasswordDetails.id,
      true,
    );
  }

  async accountVerification(payload: VerificationTokenDto): Promise<boolean> {
    const userDetails = await this.getUserByEmailAddress(payload.email);
    if (!userDetails) {
      throw new NotAcceptableException('Invalid email address');
    }

    if (userDetails.isVerified) {
      throw new ConflictException('Email already verified');
    }

    return this.resetPassword(
      userDetails.id,
      PasswordResetTypeEnum.VERIFY_ACCOUNT,
    );
  }

  async getUserByEmailAddress(email: string): Promise<UserDto> {
    const cacheKey = `user_${email.toLowerCase()}`;
    const cacheUserDetails = await this.cacheService.get<UserDto>(cacheKey);
    console.log('cacheUserDetails: ', cacheUserDetails);
    if (cacheUserDetails) {
      return plainToInstance(UserDto, cacheUserDetails);
    }
    const userDetails = await this.userDao.getUserByEmailAddress(email);
    console.log('userDetails: ', userDetails);

    if (userDetails) {
      this.cacheService
        .set(cacheKey, instanceToPlain(userDetails), ONE_DAY)
        .catch((error) => error);
    }
    return userDetails;
  }

  async changePassword(payload: ChangePasswordDto): Promise<boolean> {
    const tokenDetails = await this.resetPasswordDetailsByToken(
      payload.token,
      PasswordResetTypeEnum.RESET_PASSWORD,
    );
    if (!tokenDetails) {
      throw new ForbiddenException('Invalid token');
    }
    const userDto = new UserDto();
    userDto.password = payload.password;
    return this.updateUserAccount(tokenDetails.userId, userDto);
  }
}
