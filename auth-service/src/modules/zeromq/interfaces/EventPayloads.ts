import { IPasswordReset } from './password-reset.interface';
import { IVerifyEmail } from './verify-email.interface';
import {
  IEmailGithubScan,
  IGithubScan,
  IGithubScanResult,
} from './github-scan.interface';

export interface EmailPayloads {
  'email.password-reset': IPasswordReset;
  'email.email-verify': IVerifyEmail;
  'email.github-scan': IEmailGithubScan;
}

export interface ScanPayload {
  'scan.github-scan': IGithubScan;
}

export interface ScanResultPayload {
  'scan.github-scan-result': IGithubScanResult;
}

export type EventPayloads = EmailPayloads & ScanPayload;
