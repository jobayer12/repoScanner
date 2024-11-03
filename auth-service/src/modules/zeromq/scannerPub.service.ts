import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as zmq from 'zeromq';
import { ScanPayload } from './interfaces/EventPayloads';

@Injectable()
export class ScannerPubService implements OnModuleInit, OnModuleDestroy {
  private publisher: zmq.Publisher;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.setupPublisher().catch((r) => console.log(r));
  }

  private async setupPublisher() {
    // Create a ZeroMQ publisher socket
    this.publisher = new zmq.Publisher();
    try {
      // Bind the publisher to a TCP address
      const url = this.configService.get('zeromq.scanServicePubURL');
      const connectionURL: string = `tcp://${url}`;
      await this.publisher.bind(connectionURL);
    } catch (error) {
      console.error('Error binding ZeroMQ Publisher:', error);
    }
  }

  async publisherMessage<K extends keyof ScanPayload>(
    event: K,
    payload: ScanPayload[K],
  ): Promise<void> {
    try {
      await this.publisher.send([event, JSON.stringify(payload)]);
    } catch (error) {
      console.error('Error publishing message:', error);
    }
  }

  onModuleDestroy() {
    throw new Error('Method not implemented.');
  }
}
