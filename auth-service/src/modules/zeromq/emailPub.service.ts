import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as zmq from 'zeromq';
import { EmailPayloads } from './interfaces/EventPayloads';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailPubService implements OnModuleInit, OnModuleDestroy {
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
      const url = this.configService.get('zeromq.emailServicePubURL');
      const connectionURL: string = `tcp://${url}`;
      await this.publisher.bind(connectionURL);
    } catch (error) {
      console.error('Error binding ZeroMQ Publisher:', error);
    }
  }

  // Function to publish a message
  async publisherMessage<K extends keyof EmailPayloads>(
    event: K,
    payload: EmailPayloads[K],
  ): Promise<void> {
    try {
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
