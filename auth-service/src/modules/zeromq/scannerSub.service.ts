import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as zmq from 'zeromq';
import { ScanResultPayload } from './interfaces/EventPayloads';
import { EmitterService } from '../emitter/emitter.service';

@Injectable()
export class ScannerSubService implements OnModuleInit, OnModuleDestroy {
  private subscriber: zmq.Subscriber;

  constructor(
    private readonly configService: ConfigService,
    private readonly emitterService: EmitterService,
  ) {}

  onModuleInit() {
    this.setupSubscriber().catch((r) => console.log(r));
  }

  private async setupSubscriber<K extends keyof ScanResultPayload>() {
    // Create a ZeroMQ publisher socket
    this.subscriber = new zmq.Subscriber();
    try {
      // Bind the publisher to a TCP address
      const url = this.configService.get('zeromq.scanServiceSubURL');
      const connectionURL = `tcp://${url}`;
      this.subscriber.connect(connectionURL);
      this.subscriber.subscribe('');
      for await (const [topic, msg] of this.subscriber) {
        this.emitterService.emit(
          topic.toString() as K,
          JSON.parse(msg.toString()) as ScanResultPayload[K],
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
