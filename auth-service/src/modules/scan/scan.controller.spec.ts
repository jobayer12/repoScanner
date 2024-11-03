import { Test, TestingModule } from '@nestjs/testing';
import { ScanController } from './scan.controller';
import { ScanService } from './scan.service';
import { UserDto } from '../user/dto/user.dto';
import { AuthGuard } from '../../common/guards/AuthGuard';

describe('ScanController', () => {
  let controller: ScanController;
  let scanService: ScanService;

  const session = new UserDto();
  session.id = 1;
  session.isVerified = true;
  session.firstName = 'Test';
  session.lastName = 'User';

  const mockScanService = {
    scan: jest.fn(),
    scanById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanController],
      providers: [
        {
          provide: ScanService,
          useValue: mockScanService,
        },
        {
          provide: 'LOGGED_IN_USER',
          useValue: session,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ScanController>(ScanController);
    scanService = module.get<ScanService>(ScanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
