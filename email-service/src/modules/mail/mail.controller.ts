import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IVerifyEmail } from '../../common/interface/email-verify';
import { IPasswordReset } from '../../common/interface/password-reset.interface';
import { IGithubScan } from '../../common/interface/github-scan';

@Controller()
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @EventPattern('repo.email.verify-email')
  async userEmail(@Payload() payload: IVerifyEmail): Promise<void> {
    try {
      await this.mailService.userEmail(payload);
    } catch (error) {
      console.log('error', error);
    }
  }

  @EventPattern('repo.email.github-scan')
  async sendScanResult(@Payload() payload: IGithubScan): Promise<void> {
    try {
      await this.mailService.sendScanResult(payload);
    } catch (error) {
      console.log('error', error);
    }
  }

  @EventPattern('repo.email.password-reset')
  async passwordReset(@Payload() payload: IPasswordReset): Promise<void> {
    try {
      await this.mailService.passwordReset(payload);
    } catch (error) {
      console.log('error', error);
    }
  }
}
