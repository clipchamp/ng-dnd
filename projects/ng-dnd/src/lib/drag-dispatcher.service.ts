import { Injectable, TemplateRef, Optional } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter, map, auditTime, takeUntil, take, tap } from 'rxjs/operators';
import { DragBackend } from './backends/drag-backend';
import { DragBackendEvent } from './backends/drag-backend-event';
import { DragBackendEventType } from './backends/drag-backend-event-type';
import { DragLayer } from './drag-layer.component';
import { DragSource } from './drag-source/drag-source.directive';
import { DropTarget } from './drop-target/drop-target.directive';
import { DragRegistry } from './drag-registry';
import { coerceArray } from './utils/coercion';
import { NATIVE_FILE, NATIVE_STRING } from './utils/native-file';

@Injectable({ providedIn: 'root' })
export class DragDispatcher2 {
  dragPreviewsEnabled$: Observable<boolean>;

  private idCounter = 0;
  private dragLayer?: DragLayer;
  private readonly unsubscribes = new WeakMap<any, any>();
  private dragPreviewsEnabled = new BehaviorSubject<boolean>(true);

  constructor(
    private readonly registry: DragRegistry,
    @Optional() private readonly backend: DragBackend
  ) {
    if (!this.backend) {
      throw new Error('No drag backend provided');
    }
    this.dragPreviewsEnabled$ = this.dragPreviewsEnabled.asObservable();
  }

  connectDragSource(dragSource: DragSource, node: any): Observable<DragBackendEvent> {
    const id = `drag_${this.idCounter++}`;
    dragSource.id = id;
    this.registry.setSource(id, dragSource);
    this.unsubscribes.set(dragSource, this.backend.connectDragSource(id, node));
    const dragSourceEventStream$ = this.backend.eventStream$.pipe(
      filter(event => event.sourceId === id),
      map(event => ({ ...event, item: dragSource.item, itemType: dragSource.itemType }))
    );
    if (!!dragSource.dragPreview && dragSource.dragPreview instanceof TemplateRef) {
      this.setupDragPreviewForDragSource(dragSourceEventStream$, dragSource.dragPreview);
      // this.dragLayer.registerDragSource(dragSource, dragSourceEventStream$);
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
            return { ...event, item: files, itemType: sourceId, target: dropTarget };
          }
          if (sourceId === NATIVE_STRING) {
            return { ...event, item: strings, itemType: sourceId, target: dropTarget };
          }
          const source = this.registry.getSource(sourceId);
          if (source) {
            return {
              ...event,
              item: source.item,
              source,
              itemType: source.itemType,
              target: dropTarget
            };
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
    eventStream$
      .pipe(
        filter(
          ({ type }) =>
            (type === DragBackendEventType.DRAG_END || type === DragBackendEventType.DROP) &&
            !!this.dragLayer
        )
      )
      .subscribe(({ sourceId }) => {
        // tslint:disable-next-line:no-non-null-assertion
        this.dragLayer!.hidePreview(sourceId);
      });
    eventStream$
      .pipe(
        auditTime(16),
        filter(
          ({ type, clientOffset }) =>
            type === DragBackendEventType.DRAG_OVER &&
            !!this.dragLayer &&
            !(clientOffset.x === 0 && clientOffset.y === 0)
        )
      )
      .subscribe(({ clientOffset, sourceOffset, targetId, item, sourceId }) => {
        // tslint:disable-next-line:no-non-null-assertion
        this.dragLayer!.showPreview(sourceId, dragPreview, {
          clientOffset,
          sourceOffset,
          canDrop: !!targetId,
          $implicit: item
        });
      });
  }

  toggleDragPreviews(value?: boolean): void {
    this.dragPreviewsEnabled.next(
      value !== undefined ? value : !this.dragPreviewsEnabled.getValue()
    );
  }
}
