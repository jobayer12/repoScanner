export interface IGithubScan {
  sha: string;
  branch: string;
  repository: string;
  scanId: string;
  userId: number;
}

export type Status = 'SCAN_FAILED' | 'SCAN_DONE';

export interface IGithubScanResult {
  scanId: string;
  result: any;
  userId: number;
  status: Status;
}

export interface IEmailGithubScan {
  email: string;
  scanResultLink: string;
  status: Status;
}
