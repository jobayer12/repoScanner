import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserDao } from './user.dao';
import { ConfigService } from '@nestjs/config';
import { EmailPubService } from '../zeromq/emailPub.service';
import { CacheService } from '../cache/cache.service';
import { JwtService } from '../jwt/jwt.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserDao,
          useValue: {
            get: jest.fn,
          },
        },
        {
          provide: JwtService,
          useValue: {
            get: jest.fn,
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn,
          },
        },
        {
          provide: EmailPubService,
          useValue: {
            get: jest.fn,
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn,
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
