import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as zmq from 'zeromq';
import { EmailPayloads, ScanPayload } from './interfaces/EventPayloads';

@Injectable()
export class ZeromqService implements OnModuleInit, OnModuleDestroy {
  private publisher: zmq.Publisher;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.setupPublisher();
  }

  private async setupPublisher() {
    // Create a ZeroMQ publisher socket
    this.publisher = new zmq.Publisher();

    try {
      // Bind the publisher to a TCP address
      const host = this.configService.get('zeromq.host');
      const port = this.configService.get('zeromq.port');
      const connectionURL = `tcp://${host}:${port}`;
      await this.publisher.bind(connectionURL);
    } catch (error) {
      console.error('Error binding ZeroMQ Publisher:', error);
    }
  }

  // Function to publish a message
  async publisherEmailQueue<K extends keyof EmailPayloads>(
    event: K,
    payload: EmailPayloads[K],
  ): Promise<void> {
    console.log('zero mq event', event);
    console.log('zero mq payload', payload);
    try {
      await this.publisher.send([event, JSON.stringify(payload)]);
    } catch (error) {
      console.error('Error publishing message:', error);
    }
  }

  async publishScanQueue<K extends keyof ScanPayload>(
    event: K,
    payload: ScanPayload[K],
  ): Promise<void> {
    try {
      console.log('zero mq scan event', event);
      console.log('zero mq scan payload', payload);
      await this.publisher.send([event, JSON.stringify(payload)]);
    } catch (error) {
      console.error('Error publishing message:', error);
    }
  }

  async onModuleDestroy() {
    if (this.publisher) {
      this.publisher.close();
    }
  }
}
