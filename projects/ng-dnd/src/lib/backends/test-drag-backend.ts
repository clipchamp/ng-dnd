import { DragDispatcher2 } from '../drag-dispatcher.service';
import { DragBackend } from './drag-backend';
import { Unsubscribe } from './unsubscribe';
import { DragBackendFactory } from './drag-backend-factory';
import { DragBackendEvent } from './drag-backend-event';

export function testDragBackendFactory(): DragBackendFactory {
  return (dispatcher: DragDispatcher2) => new TestDragBackend(dispatcher);
}

export class TestDragBackend extends DragBackend {
  constructor(dispatcher: DragDispatcher2) {
    super();
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
