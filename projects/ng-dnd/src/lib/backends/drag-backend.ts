import { NgZone } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { DragBackendEvent } from './drag-backend-event';
import { Unsubscribe } from './unsubscribe';
import { DragMonitor } from '../drag-monitor';

export abstract class DragBackend {
  protected readonly eventStream = new Subject<DragBackendEvent>();
  readonly eventStream$: Observable<DragBackendEvent> = this.eventStream.asObservable();
  abstract connectDragSource(sourceId: string, node: any): Unsubscribe;
  abstract connectDropTarget(targetId: string, node: any): Unsubscribe;
  constructor(protected readonly monitor: DragMonitor, protected readonly ngZone: NgZone) {}
}
