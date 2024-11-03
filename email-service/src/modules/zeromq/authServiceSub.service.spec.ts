import { Test, TestingModule } from '@nestjs/testing';
import { AuthServiceSubService } from './authServiceSub.service';

describe('ZeromqService', () => {
  let service: AuthServiceSubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthServiceSubService],
    }).compile();

    service = module.get<AuthServiceSubService>(AuthServiceSubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
