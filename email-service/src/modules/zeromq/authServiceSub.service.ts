import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as zmq from 'zeromq';
import { EmitterService } from '../emitter/emitter.service';
import { EventPayloads } from '../emitter/interfaces/EventPayloads';

@Injectable()
export class AuthServiceSubService implements OnModuleInit, OnModuleDestroy {
  private subscriber: zmq.Subscriber;

  constructor(
    private readonly configService: ConfigService,
    private readonly emitterService: EmitterService,
  ) {}

  onModuleInit() {
    this.setupSubscriber().catch((error) => console.log(error));
  }

  private async setupSubscriber<K extends keyof EventPayloads>() {
    // Create a ZeroMQ publisher socket
    this.subscriber = new zmq.Subscriber();

    try {
      // Bind the publisher to a TCP address
      const url = this.configService.get('zeromq.subURL');
      const connectionURL = `tcp://${url}`;
      this.subscriber.connect(connectionURL);
      this.subscriber.subscribe(
        'email.github-scan',
        'email.password-reset',
        'email.email-verify',
      );
      for await (const [topic, msg] of this.subscriber) {
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
