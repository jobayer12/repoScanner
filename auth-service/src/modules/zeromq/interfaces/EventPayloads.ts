import { IPasswordReset } from './password-reset.interface';
import { IVerifyEmail } from './verify-email.interface';
import { IGithubScan } from './github-scan.interface';

export interface EmailPayloads {
  'email.password-reset': IPasswordReset;
  'email.email-verify': IVerifyEmail;
}

export interface ScanPayload {
  'scan.github-scan': IGithubScan;
}

export type EventPayloads = EmailPayloads & ScanPayload;
