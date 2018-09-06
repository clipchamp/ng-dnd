import { NgZone } from '@angular/core';
import { DragMonitor } from '../drag-monitor';
import { DragBackend } from './drag-backend';
import { Unsubscribe } from './unsubscribe';
import { DragBackendFactory } from './drag-backend-factory';
import { DragBackendEvent } from './drag-backend-event';

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

export function testDragBackendFactory(): DragBackendFactory {
  return (monitor: DragMonitor, ngZone: NgZone) => new TestDragBackend(monitor, ngZone);
}
