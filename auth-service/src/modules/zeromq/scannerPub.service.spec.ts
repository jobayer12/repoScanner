import { Test, TestingModule } from '@nestjs/testing';
import {ScannerPubService} from "./scannerPub.service";

describe('ScannerPubService', () => {
  let service: ScannerPubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScannerPubService],
    }).compile();

    service = module.get<ScannerPubService>(ScannerPubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
