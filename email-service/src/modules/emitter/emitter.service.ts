import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventPayloads } from './interfaces/EventPayloads';

@Injectable()
export class EmitterService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit<K extends keyof EventPayloads>(
    event: K,
    payload: EventPayloads[K],
  ): boolean {
    console.log('EmitterService', event, payload);
    return this.eventEmitter.emit(event, payload);
  }
}
