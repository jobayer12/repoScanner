import { Test, TestingModule } from '@nestjs/testing';
import { EmitterService } from './emitter.service';

describe('EmitterService', () => {
  let service: EmitterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmitterService],
    }).compile();

    service = module.get<EmitterService>(EmitterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
