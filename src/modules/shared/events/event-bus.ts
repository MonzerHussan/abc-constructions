import { EventEmitter } from 'events';
import { logger } from '@/modules/shared/utils/logger';
import type { IEventBus, IEvent, EventHandler } from '@/modules/shared/events/types';

class NodeEventBus implements IEventBus {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(100);
  }

  async publish(event: IEvent): Promise<void> {
    const { name, metadata } = event;
    logger.info(`Event published: ${name}`, {
      eventName: name,
      correlationId: metadata.correlationId,
      source: metadata.source,
    });
    try {
      this.emitter.emit(name, event);
    } catch (err) {
      logger.error(`Event handler failed for ${name}`, {
        error: err instanceof Error ? err.message : String(err),
        correlationId: metadata.correlationId,
        eventName: name,
      });
    }
  }

  subscribe(eventName: string, handler: EventHandler): void {
    this.emitter.on(eventName, async (event: IEvent) => {
      try {
        await handler(event);
      } catch (err) {
        logger.error(`Unhandled error in event handler for ${eventName}`, {
          error: err instanceof Error ? err.message : String(err),
          correlationId: event.metadata.correlationId,
        });
      }
    });
    logger.debug(`Handler subscribed to: ${eventName}`);
  }

  unsubscribe(eventName: string, handler: EventHandler): void {
    this.emitter.off(eventName, handler);
    logger.debug(`Handler unsubscribed from: ${eventName}`);
  }
}

export const eventBus: IEventBus = new NodeEventBus();
