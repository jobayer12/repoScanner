import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDao } from './user.dao';
import {
  UserCreatePayload,
  UserDetails,
  UserLoginPayload,
} from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { PasswordResetDto } from './dto/password-reset.dto';
import { nanoid } from 'nanoid';
import { PasswordResetTypeEnum } from 'src/common/enum/password-reset-type.enum';

@Injectable()
export class UserService {
  constructor(
    private readonly userDao: UserDao,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createAccount(user: UserCreatePayload): Promise<number> {
    const userDetails = await this.userDao.getUserByEmailAddress(user.password);
    if (userDetails) {
      throw new Error('Email already exists');
    }
    user.password = bcrypt.hashSync(user.password);
    const id = await this.userDao.create(user);
    if (id > 0) {
    }
    return id;
  }

  async login(user: UserLoginPayload): Promise<string> {
    const userDetails = await this.userDao.getUserByEmailAddress(user.email);
    if (!userDetails) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = bcrypt.compareSync(
      user.password,
      userDetails.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    const jwtTokenDetails = plainToInstance(UserDetails, user);

    return this.jwtService.sign(instanceToPlain(jwtTokenDetails), {
      secret: this.configService.get('jwt.secret'),
      expiresIn: '48h',
    });
  }

  async resetPassword(
    userId: number,
    type: PasswordResetTypeEnum,
  ): Promise<boolean> {
    const payload = new PasswordResetDto();
    payload.userId = userId;
    payload.type = type;
    payload.token = bcrypt.genSaltSync(10) + nanoid(10);
    const response = await this.userDao.resetPassword(payload);
    if (response.length > 0) {
    }

    return response.length > 0;
  }
}
