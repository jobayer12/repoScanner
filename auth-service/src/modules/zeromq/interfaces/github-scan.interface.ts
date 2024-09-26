export interface IGithubScan {
  sha: string;
  branch: string;
  repository: string;
  scanId: string;
}

export interface IGithubScanResult {
  scanId: string;
  result: any;
}
