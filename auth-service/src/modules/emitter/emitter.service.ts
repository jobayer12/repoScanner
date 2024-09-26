import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ScanResultPayload } from '../zeromq/interfaces/EventPayloads';

@Injectable()
export class EmitterService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  emit<K extends keyof ScanResultPayload>(
    event: K,
    payload: ScanResultPayload[K],
  ): boolean {
    return this.eventEmitter.emit(event, payload);
  }
}
