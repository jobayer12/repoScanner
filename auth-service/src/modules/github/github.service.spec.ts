import { Test, TestingModule } from '@nestjs/testing';
import { GithubService } from './github.service';
import { HttpService } from '@nestjs/axios';

describe('GithubService', () => {
  let service: GithubService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn,
          },
        },
      ],
    }).compile();

    service = module.get<GithubService>(GithubService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('check the valid public repository', () => {
    it('should return the github repository details', async () => {
      const result = await service.repository(
        'https://github.com/jobayer12/repoScanner',
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });
  });

  describe('check the invalid repository', () => {
    it('should return null if the github repository doesn`t exists/private repository', async () => {
      const result = await service.repository(
        'https://github.com/jobayer12/unknowgithubrepository',
      );
      expect(result).toBeNull();
    });

    it('should return null if the github branch name doesn`t exists', async () => {
      const result = await service.branch(
        'https://github.com/jobayer12/repoScanner',
        'unknown',
      );
      expect(result).toBeNull();
    });
  });
});
