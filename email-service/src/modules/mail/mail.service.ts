import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { IVerifyEmail } from '../../common/interface/email-verify';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  @EventPattern('repo.email.password-reset')
  userEmail(@Payload() payload: IVerifyEmail): void {
    console.log('payload: ', payload);
    // try {
    //   const response = await this.mailerService.sendMail({
    //     to: payload.email,
    //     subject: `Verify Email`,
    //     template: 'email-verification',
    //     context: payload,
    //   });
    //   console.log('response', response);
    // } catch (error) {
    //   console.log('error', error);
    // }
  }

  // @EventPattern('email.github-scan')
  // async sendScanResult(
  //   payload: EventPayloads['email.github-scan'],
  // ): Promise<void> {
  //   try {
  //     await this.mailerService.sendMail({
  //       to: payload.email,
  //       subject: 'Github Scan Result',
  //       template: 'github-scan',
  //       context: {
  //         ...payload,
  //         isScanDone: payload.status === 'SCAN_DONE',
  //       },
  //     });
  //   } catch (error) {
  //     console.log('error', error);
  //   }
  // }

  // @EventPattern('email.password-reset')
  // async passwordReset<K extends keyof EventPayloads>(
  //   payload: EventPayloads[K],
  // ): Promise<void> {
  //   try {
  //     const response = await this.mailerService.sendMail({
  //       to: payload.email,
  //       subject: `Password Reset`,
  //       template: 'password-reset',
  //       context: payload,
  //     });
  //     console.log('response', response);
  //   } catch (error) {
  //     console.log('error', error);
  //   }
  // }
}
