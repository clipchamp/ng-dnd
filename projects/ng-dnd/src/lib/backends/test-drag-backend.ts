import { NgZone, Injectable, OnDestroy } from '@angular/core';
import { DragMonitor } from '../drag-monitor';
import { DragBackend } from './drag-backend';
import { Unsubscribe } from './unsubscribe';
import { DragBackendEvent } from './drag-backend-event';
import { DragBackendEventType } from './drag-backend-event-type';
import { Coordinates } from './offset';

@Injectable({ providedIn: 'root' })
export class TestDragBackend extends DragBackend implements OnDestroy {
  private lastEvent?: DragBackendEvent;

  constructor(monitor: DragMonitor, ngZone: NgZone) {
    super(monitor, ngZone);
  }

  ngOnDestroy(): void {
    this.eventStream.complete();
  }

  connectDragSource(sourceId: string, node: any): Unsubscribe {
    return () => {};
  }

  connectDropTarget(targetId: string, node: any): Unsubscribe {
    return () => {};
  }

  startDrag<T = any>(itemType: string, item: T, offset: Coordinates): void {
    const event = {
      type: DragBackendEventType.DRAG_START,
      clientOffset: offset,
      itemType,
      item
    };
    this.lastEvent = event;
    this.publish(event);
  }

  stopDrag(): void {
    this.publish({
      ...this.lastEvent,
      type: DragBackendEventType.DRAG_END
    });
  }

  drop(): void {
    this.publish({
      ...this.lastEvent,
      type: DragBackendEventType.DROP
    });
  }

  publish(event: DragBackendEvent): void {
    this.eventStream.next(event);
  }
}

export const TEST_DRAG_BACKEND_PROVIDER = {
  provide: DragBackend,
  useExisting: TestDragBackend
};
