import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    createAccount: jest.fn(),
    login: jest.fn(),
    userById: jest.fn(),
    resetPassword: jest.fn(),
    updateUserAccount: jest.fn(),
    resetPasswordDetailsByToken: jest.fn(),
    verifyUserAccount: jest.fn(),
    accountVerification: jest.fn(),
    getUserByEmailAddress: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
