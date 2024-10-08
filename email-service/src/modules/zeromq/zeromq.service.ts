import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as zmq from 'zeromq';
import { EmitterService } from '../emitter/emitter.service';
import { EventPayloads } from '../emitter/interfaces/EventPayloads';

@Injectable()
export class ZeromqService implements OnModuleInit, OnModuleDestroy {
  private subscriber: zmq.Subscriber;

  constructor(
    private readonly configService: ConfigService,
    private readonly emitterService: EmitterService,
  ) {}

  onModuleInit() {
    this.setupSubscriber().catch((r) => console.log(r));
  }

  private async setupSubscriber<K extends keyof EventPayloads>() {
    // Create a ZeroMQ publisher socket
    this.subscriber = new zmq.Subscriber();

    try {
      // Bind the publisher to a TCP address
      const host = this.configService.get('zeromq.host');
      const port = this.configService.get('zeromq.port');
      const connectionURL = `tcp://${host}:${port}`;
      this.subscriber.connect(connectionURL);
      this.subscriber.subscribe(
        'email-authService',
        'scanResult-scannerService',
      );
      for await (const [topic, msg] of this.subscriber) {
        console.log('topic', topic.toString(), msg.toString());
        this.emitterService.emit(
          topic.toString() as K,
          JSON.parse(msg.toString()) as EventPayloads[K],
        );
      }
    } catch (error) {
      console.error('Error binding ZeroMQ Publisher:', error);
    }
  }

  onModuleDestroy() {}
}
