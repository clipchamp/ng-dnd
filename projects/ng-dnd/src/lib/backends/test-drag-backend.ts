import { NgZone, Injectable } from '@angular/core';
import { DragMonitor } from '../drag-monitor';
import { DragBackend } from './drag-backend';
import { Unsubscribe } from './unsubscribe';
import { DragBackendEvent } from './drag-backend-event';

@Injectable({ providedIn: 'root' })
export class TestDragBackend extends DragBackend {
  constructor(monitor: DragMonitor, ngZone: NgZone) {
    super(monitor, ngZone);
  }

  connectDragSource(sourceId: string, node: any): Unsubscribe {
    return () => {};
  }

  connectDropTarget(targetId: string, node: any): Unsubscribe {
    return () => {};
  }

  publish(event: DragBackendEvent): void {
    this.eventStream.next(event);
  }
}

export const TEST_DRAG_BACKEND_PROVIDER = {
  provide: DragBackend,
  useClass: TestDragBackend
};
