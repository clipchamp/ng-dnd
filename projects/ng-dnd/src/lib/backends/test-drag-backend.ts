import { DragMonitor } from '../drag-monitor';
import { DragBackend } from './drag-backend';
import { Unsubscribe } from './unsubscribe';
import { DragBackendFactory } from './drag-backend-factory';
import { DragBackendEvent } from './drag-backend-event';

export function testDragBackendFactory(): DragBackendFactory {
  return (monitor: DragMonitor) => new TestDragBackend(monitor);
}

export class TestDragBackend extends DragBackend {
  constructor(monitor: DragMonitor) {
    super(monitor);
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
