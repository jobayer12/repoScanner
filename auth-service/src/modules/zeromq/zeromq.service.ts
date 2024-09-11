import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZeroMQTopic } from '../../common/enum/zeromq-topic.enum';
import * as zmq from 'zeromq';

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
      const url = this.configService.get('zeromq.url');
      const port = this.configService.get('zeromq.port');
      const connectionURL = `tcp://${url}:${port}`;
      await this.publisher.bind(connectionURL);
    } catch (error) {
      console.error('Error binding ZeroMQ Publisher:', error);
    }
  }

  // Function to publish a message
  async publisherMessage(topic: ZeroMQTopic, message: string): Promise<number> {
    try {
      await this.publisher.send([topic, message]);
      return 1;
    } catch (error) {
      console.error('Error publishing message:', error);
      return 1;
    }
  }

  async onModuleDestroy() {
    if (this.publisher) {
      this.publisher.close();
    }
  }
}
