import { Test, TestingModule } from '@nestjs/testing';
import { EmailPubService } from './emailPub.service';

describe('EmailPubService', () => {
  let service: EmailPubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailPubService],
    }).compile();

    service = module.get<EmailPubService>(EmailPubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
