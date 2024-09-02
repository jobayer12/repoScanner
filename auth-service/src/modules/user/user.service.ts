import { Injectable } from '@nestjs/common';
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
    return this.userDao.create(user);
  }

  async login(user: UserLoginPayload): Promise<string> {
    const userDetails = await this.userDao.getUserByEmailAddress(user.email);
    if (!userDetails) {
      throw new Error('Invalid credentials');
    }
    const isPasswordValid = bcrypt.compareSync(
      user.password,
      userDetails.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials.');
    }
    const jwtTokenDetails = plainToInstance(UserDetails, user);

    return this.jwtService.sign(instanceToPlain(jwtTokenDetails), {
      secret: this.configService.get('jwt.secret'),
      expiresIn: '48h',
    });
  }
}
