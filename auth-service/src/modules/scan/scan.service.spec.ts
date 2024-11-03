import { Test, TestingModule } from '@nestjs/testing';
import { ScanService } from './scan.service';
import { GithubService } from '../github/github.service';
import { ScannerPubService } from '../zeromq/scannerPub.service';
import { ScanDao } from './scan.dao';
import { EmailPubService } from '../zeromq/emailPub.service';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';

describe('ScanService', () => {
  let service: ScanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanService,
        {
          provide: GithubService,
          useValue: {
            get: jest.fn,
          },
        },
        {
          provide: ScannerPubService,
          useValue: {
            get: jest.fn,
          },
        },
        {
          provide: ScanDao,
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
          provide: UserService,
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

    service = module.get<ScanService>(ScanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
