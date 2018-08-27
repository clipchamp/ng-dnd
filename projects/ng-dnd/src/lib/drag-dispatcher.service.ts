import { Injectable, TemplateRef, Inject, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { DragBackend } from './backends/drag-backend';
import { DragBackendEvent } from './backends/drag-backend-event';
import { DragBackendEventType } from './backends/drag-backend-event-type';
import { DRAG_BACKEND } from './backends/drag-backend-factory';
import { DragLayer } from './drag-layer.component';
import { DragSource } from './drag-source/drag-source.directive';
import { DropTarget } from './drop-target/drop-target.directive';
import { DragRegistry } from './drag-registry';
import { DragMonitor } from './drag-monitor';
import { coerceArray } from './utils/coercion';
import { NATIVE_FILE, NATIVE_STRING } from './utils/native-file';

@Injectable()
export class DragDispatcher2 {
  private idCounter = 0;
  private readonly registry = new DragRegistry();
  private readonly monitor = new DragMonitor(this.registry);
  private readonly backend: DragBackend = null;
  private dragLayer?: DragLayer;
  private readonly unsubscribes = new WeakMap<any, any>();

  constructor(
    @Optional()
    @Inject(DRAG_BACKEND)
    private readonly backendFactory: any
  ) {
    if (!this.backendFactory) {
      throw new Error('No drag backend provided');
    }
    this.backend = backendFactory(this.monitor);
  }

  connectDragSource(dragSource: DragSource, node: any): Observable<DragBackendEvent> {
    const id = `drag_${this.idCounter++}`;
    dragSource.id = id;
    this.registry.setSource(id, dragSource);
    this.unsubscribes.set(dragSource, this.backend.connectDragSource(id, node));
    const dragSourceEventStream$ = this.backend.eventStream$.pipe(
      filter(event => event.sourceId === id),
      map(event => ({ ...event, item: dragSource.item }))
    );
    if (!!dragSource.dragPreview && dragSource.dragPreview instanceof TemplateRef) {
      this.setupDragPreviewForDragSource(dragSourceEventStream$, dragSource.dragPreview);
    }
    return dragSourceEventStream$;
  }

  disconnectDragSource(dragSource: DragSource): void {
    const unsubscribe = this.unsubscribes.get(dragSource);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribes.delete(dragSource);
      // Delay removal of drag source from registry so the queued microtasks that rely on it get executed first
      Promise.resolve(() => this.registry.deleteSource(dragSource.id));
    }
  }

  connectDropTarget(dropTarget: DropTarget, node: any): Observable<DragBackendEvent> {
    const id = `drop_${this.idCounter++}`;
    dropTarget.id = id;
    this.registry.setTarget(id, dropTarget);
    this.unsubscribes.set(dropTarget, this.backend.connectDropTarget(id, node));
    return this.backend.eventStream$.pipe(
      filter(event => event.targetId === id),
      map(({ sourceId, targetId, files, strings, ...event }) => {
        if (sourceId) {
          if (sourceId === NATIVE_FILE) {
            return { ...event, item: files, target: dropTarget };
          }
          if (sourceId === NATIVE_STRING) {
            return { ...event, item: strings, target: dropTarget };
          }
          const source = this.registry.getSource(sourceId);
          if (source) {
            return { ...event, item: source.item, source, target: dropTarget };
          }
        }
        return event;
      })
    );
  }

  disconnectDropTarget(dropTarget: DropTarget): void {
    this.registry.deleteTarget(dropTarget.id);
    const unsubscribe = this.unsubscribes.get(dropTarget);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribes.delete(dropTarget);
    }
  }

  connectDragLayer(dragLayer: DragLayer): void {
    this.dragLayer = dragLayer;
  }

  dragging$(itemType: string | string[]): Observable<boolean> {
    itemType = coerceArray(itemType);
    return this.backend.eventStream$.pipe(
      filter(
        event =>
          event.type === DragBackendEventType.DRAG_START ||
          event.type === DragBackendEventType.DRAG_END ||
          event.type === DragBackendEventType.DROP
      ),
      filter(event => {
        const source = this.registry.getSource(event.sourceId);
        return (
          (source && itemType.indexOf(source.itemType) > -1) ||
          (!source && itemType.indexOf(event.sourceId) > -1)
        );
      }),
      map(event => event.type === DragBackendEventType.DRAG_START)
    );
  }

  private setupDragPreviewForDragSource(
    eventStream$: Observable<DragBackendEvent>,
    dragPreview: TemplateRef<any>
  ): void {
    let active = false;
    let offset;
    eventStream$
      .pipe(filter(event => event.type === DragBackendEventType.DRAG_START && !!this.dragLayer))
      .subscribe(event => {
        active = true;
        offset = event.sourceOffset;
        // tslint:disable-next-line:no-non-null-assertion
        this.dragLayer!.showPreview(event.sourceId, dragPreview, {
          position: {
            x: event.clientOffset.x - offset.x,
            y: event.clientOffset.y - offset.y
          },
          width: offset.width,
          height: offset.height,
          canDrop: !!event.targetId,
          $implicit: event.item
        });
      });
    eventStream$
      .pipe(
        filter(
          event =>
            active &&
            event.type === DragBackendEventType.DRAG_OVER &&
            !!this.dragLayer &&
            !(event.clientOffset.x === 0 && event.clientOffset.y === 0)
        )
      )
      .subscribe(event => {
        // tslint:disable-next-line:no-non-null-assertion
        this.dragLayer!.updatePreview(event.sourceId, {
          position: {
            x: event.clientOffset.x - offset.x,
            y: event.clientOffset.y - offset.y
          },
          width: offset.width,
          height: offset.height,
          canDrop: !!event.targetId,
          $implicit: event.item
        });
      });
    eventStream$
      .pipe(
        filter(
          event =>
            active &&
            (event.type === DragBackendEventType.DRAG_END ||
              event.type === DragBackendEventType.DROP) &&
            !!this.dragLayer
        )
      )
      .subscribe(event => {
        active = false;
        // tslint:disable-next-line:no-non-null-assertion
        this.dragLayer!.hidePreview(event.sourceId);
      });
  }
}
