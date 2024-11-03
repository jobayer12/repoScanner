import { Test, TestingModule } from '@nestjs/testing';
import { EmailPubService } from './emailPub.service';
import { ConfigService } from '@nestjs/config';

describe('EmailPubService', () => {
  let service: EmailPubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailPubService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn,
          },
        },
      ],
    }).compile();

    service = module.get<EmailPubService>(EmailPubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
