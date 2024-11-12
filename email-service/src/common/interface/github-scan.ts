export interface IGithubScan {
    email: string;
    scanResultLink: string;
    status: 'SCAN_FAILED' | 'SCAN_DONE';
}