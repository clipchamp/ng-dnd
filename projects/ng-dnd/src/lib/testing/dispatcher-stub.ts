import { Injectable, Injector } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DragSource } from '../drag-source/drag-source.directive';
import { DropTarget } from '../drop-target/drop-target.directive';
import { DragDispatcher2 } from '../drag-dispatcher.service';
import { DragBackendEvent } from '../backends/drag-backend-event';
import { DragBackendEventType } from '../backends/drag-backend-event-type';

/**
 * Utility service to emit drag events.
 */
@Injectable()
export class DispatcherStubController {
  readonly eventStream$: Observable<DragBackendEvent>;
  private readonly eventStream = new Subject<DragBackendEvent>();

  constructor() {
    this.eventStream$ = this.eventStream.asObservable();
  }

  publish(event: DragBackendEvent): void {
    this.eventStream.next(event);
  }
}

/**
 * Simplified dispatcher for testing purposes.
 */
@Injectable()
export class DispatcherStub {
  get controller(): DispatcherStubController {
    if (!this._controller) {
      this._controller = this.injector.get(DispatcherStubController);
    }
    return this._controller;
  }

  private _controller?: DispatcherStubController;

  constructor(private readonly injector: Injector) {}

  connectDragSource(source: DragSource, node: any): Observable<DragBackendEvent> {
    return this.controller.eventStream$;
  }

  disconnectDragSource(source: DragSource): void {}

  connectDropTarget(target: DropTarget, node: any): Observable<DragBackendEvent> {
    return this.controller.eventStream$.pipe(
      filter(
        ({ itemType }) =>
          (typeof target.itemType === 'string' && itemType === target.itemType) ||
          (typeof target.itemType === 'object' && target.itemType.indexOf(itemType) > -1)
      )
    );
  }

  disconnectDropTarget(target: DropTarget): void {}

  dragging$(itemTypes: string | string[]): Observable<boolean> {
    return this.controller.eventStream$.pipe(
      filter(
        ({ type, itemType }) =>
          (type === DragBackendEventType.DRAG_START ||
            type === DragBackendEventType.DRAG_END ||
            type === DragBackendEventType.DROP) &&
          ((typeof itemTypes === 'string' && itemType === itemTypes) ||
            (typeof itemTypes === 'object' && itemTypes.indexOf(itemType) > -1))
      ),
      map(({ type }) => type === DragBackendEventType.DRAG_START)
    );
  }
}

export const DISPATCHER_STUB_PROVIDERS = [
  {
    provide: DragDispatcher2,
    useClass: DispatcherStub
  },
  DispatcherStubController
];
