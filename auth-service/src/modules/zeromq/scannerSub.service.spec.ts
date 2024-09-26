import { Test, TestingModule } from '@nestjs/testing';
import {ScannerSubService} from "./scannerSub.service";

describe('ScannerSubService', () => {
  let service: ScannerSubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScannerSubService],
    }).compile();

    service = module.get<ScannerSubService>(ScannerSubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
