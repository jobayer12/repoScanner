import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventPayloads } from '../emitter/interfaces/EventPayloads';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  @OnEvent('email.email-verify')
  async userEmail<K extends keyof EventPayloads>(
    payload: EventPayloads[K],
  ): Promise<void> {
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

  @OnEvent('email.github-scan')
  async sendScanResult<K extends keyof EventPayloads>(
      payload: EventPayloads[K],
  ): Promise<void> {
    try {

    } catch (error) {
      console.log('error', error);
    }
  }

  @OnEvent('email.password-reset')
  async passwordReset<K extends keyof EventPayloads>(
    payload: EventPayloads[K],
  ): Promise<void> {
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

  @OnEvent('app.github-app')
  async scanResult<K extends keyof EventPayloads>(
    payload: EventPayloads[K],
  ): Promise<void> {
    try {
      const response = await this.mailerService.sendMail({
        to: payload.email,
        subject: `Password Reset`,
        template: 'github-app',
        context: payload,
      });
      console.log('response', response);
    } catch (error) {
      console.log('error', error);
    }
  }
}
