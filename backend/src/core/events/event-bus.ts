import { EventEmitter } from 'node:events';

import { logger } from '@/core/logger';

/**
 * Bản đồ event -> payload. Feature tự khai báo event của mình bằng module augmentation,
 * để core không phải import features:
 *
 *   declare module '@/core/events/event-bus' {
 *     interface AppEvents { 'game.deleted': { gameId: number } }
 *   }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppEvents {}

export type AppEventName = keyof AppEvents;
type Listener<K extends AppEventName> = (payload: AppEvents[K]) => void | Promise<void>;

class EventBus {
  private readonly emitter = new EventEmitter();

  on<K extends AppEventName>(event: K, listener: Listener<K>): () => void {
    // Bọc listener để lỗi (kể cả async) chỉ ghi log, không làm sập request đã phát event
    const wrapped = (payload: AppEvents[K]) => {
      Promise.resolve()
        .then(() => listener(payload))
        .catch((err: unknown) => logger.error({ err, event }, 'event.listener_failed'));
    };
    this.emitter.on(event, wrapped);
    return () => this.emitter.off(event, wrapped);
  }

  emit<K extends AppEventName>(event: K, payload: AppEvents[K]): void {
    this.emitter.emit(event, payload);
  }
}

export const eventBus = new EventBus();
