import { Test, TestingModule } from '@nestjs/testing';
import { ZeromqService } from './zeromq.service';

describe('ZeromqService', () => {
  let service: ZeromqService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZeromqService],
    }).compile();

    service = module.get<ZeromqService>(ZeromqService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
