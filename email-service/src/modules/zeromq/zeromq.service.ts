import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as zmq from 'zeromq';

@Injectable()
export class ZeromqService implements OnModuleInit, OnModuleDestroy {
  private subscriber: zmq.Subscriber;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.setupPublisher();
  }

  private async setupPublisher() {
    // Create a ZeroMQ publisher socket
    this.subscriber = new zmq.Subscriber();

    try {
      // Bind the publisher to a TCP address
      const host = this.configService.get('zeromq.host');
      const port = this.configService.get('zeromq.port');
      const connectionURL = `tcp://${host}:${port}`;
      this.subscriber.connect(connectionURL);
      this.subscriber.subscribe('email');
      for await (const [topic, msg] of this.subscriber) {
        console.log(
          `Received message on topic "${topic.toString()}": ${msg.toString()}`,
        );
      }
    } catch (error) {
      console.error('Error binding ZeroMQ Publisher:', error);
    }
  }

  onModuleDestroy() {
    throw new Error('Method not implemented.');
  }
}
