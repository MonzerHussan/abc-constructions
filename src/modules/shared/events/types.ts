export interface IEvent {
  name: string;
  version: number;
  payload: unknown;
  metadata: {
    timestamp: Date;
    correlationId: string;
    source: string;
    requestId?: string;
    userId?: string;
    orgId?: string;
  };
}

export type EventHandler = (event: IEvent) => Promise<void>;

export interface IEventBus {
  publish(event: IEvent): Promise<void>;
  subscribe(eventName: string, handler: EventHandler): void;
  unsubscribe(eventName: string, handler: EventHandler): void;
}

export function buildEventName(
  domain: string,
  entity: string,
  action: string
): string {
  return `${domain}.${entity}.${action}`;
}
