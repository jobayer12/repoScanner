import { IGithubScan } from './github-scan.interface';
import { IPasswordReset } from './password-reset.interface';
import { IVerifyEmail } from './verify-email.interface';

export interface EventPayloads {
  'email.password-reset': IPasswordReset;
  'email.email-verify': IVerifyEmail;
  'email.github-scan': IGithubScan;
}
