import { Test, TestingModule } from '@nestjs/testing';
import { EmitterService } from './emitter.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('EmitterService', () => {
  let service: EmitterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmitterService,
        {
          provide: EventEmitter2,
          useValue: {
            get: jest.fn,
          },
        },
      ],
    }).compile();

    service = module.get<EmitterService>(EmitterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
