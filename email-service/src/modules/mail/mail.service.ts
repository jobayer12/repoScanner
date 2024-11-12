import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { IVerifyEmail } from '../../common/interface/email-verify';
import { IPasswordReset } from '../../common/interface/password-reset.interface';
import {IGithubScan} from "../../common/interface/github-scan";

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async userEmail(payload: IVerifyEmail): Promise<void> {
    try {
      const response = await this.mailerService.sendMail({
        to: payload.email,
        subject: `Verify Email`,
        template: 'email-verification',
        context: payload,
      });
      console.log('response', response);
    } catch (error) {
      console.log('error', error);
    }
  }

  async sendScanResult(payload: IGithubScan): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: payload.email,
        subject: 'Github Scan Result',
        template: 'github-scan',
        context: {
          ...payload,
          isScanDone: payload.status === 'SCAN_DONE',
        },
      });
    } catch (error) {
      console.log('error', error);
    }
  }

  async passwordReset(payload: IPasswordReset): Promise<void> {
    try {
      const response = await this.mailerService.sendMail({
        to: payload.email,
        subject: `Password Reset`,
        template: 'password-reset',
        context: payload,
      });
      console.log('response', response);
    } catch (error) {
      console.log('error', error);
    }
  }
}
