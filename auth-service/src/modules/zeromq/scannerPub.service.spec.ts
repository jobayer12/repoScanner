import { Test, TestingModule } from '@nestjs/testing';
import { ScannerPubService } from './scannerPub.service';
import { ConfigService } from '@nestjs/config';

describe('ScannerPubService', () => {
  let service: ScannerPubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScannerPubService, ConfigService],
    }).compile();

    service = module.get<ScannerPubService>(ScannerPubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
