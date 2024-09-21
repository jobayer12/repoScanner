import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as zmq from 'zeromq';
import { ScanPayload } from './interfaces/EventPayloads';

@Injectable()
export class ZeromqScanService implements OnModuleInit, OnModuleDestroy {
  private publisher: zmq.Publisher;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.setupPublisher();
  }

  private async setupPublisher() {
    // Create a ZeroMQ publisher socket
    this.publisher = new zmq.Publisher();

    try {
      // Bind the publisher to a TCP address
      const host = this.configService.get('zeromq.host');
      const port = this.configService.get('zeromq.port');
      const connectionURL: string = `tcp://${host}:${port}/scan`;
      await this.publisher.bind(connectionURL);
    } catch (error) {
      console.error('Error binding ZeroMQ Publisher:', error);
    }
  }

  async publishScanQueue<K extends keyof ScanPayload>(
    event: K,
    payload: ScanPayload[K],
  ): Promise<void> {
    try {
      console.log('event', event);
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
