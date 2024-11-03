import { Test, TestingModule } from '@nestjs/testing';
import { ScannerSubService } from './scannerSub.service';
import { ConfigService } from '@nestjs/config';
import { EmitterService } from '../emitter/emitter.service';

describe('ScannerSubService', () => {
  let service: ScannerSubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScannerSubService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn,
          },
        },
        {
          provide: EmitterService,
          useValue: {
            get: jest.fn,
          },
        },
      ],
    }).compile();

    service = module.get<ScannerSubService>(ScannerSubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
