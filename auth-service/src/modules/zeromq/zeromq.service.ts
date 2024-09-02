import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as zmq from 'zeromq';
import { MessageLike } from 'zeromq';

@Injectable()
export class ZeromqService implements OnModuleInit {
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
  async publisherMessage(topic: MessageLike, message: string) {
    try {
      console.log(`Publishing message on topic "${topic}"`, message);
      // Send the message with the specified topic
      this.publisher.send([topic, message]);
      return 'Message Queue Successfully';
    } catch (error) {
      console.error('Error publishing message:', error);
    }
  }
}
