import { Injectable, TemplateRef, Inject, Optional } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { DragLayer } from './drag-layer.component';
import { DragSource } from './drag-source.directive';
import { DropTarget } from './drop-target.directive';
import { getEmptyImage } from './get-empty-image';
import { DragBackend } from './backends/drag-backend';
import { DragBackendEvent } from './backends/drag-backend-event';
import { DragBackendEventType } from './backends/drag-backend-event-type';
import { DRAG_BACKEND } from './backends/drag-backend-factory';

@Injectable()
export class DragDispatcher2 {
  private idCounter = 0;
  private readonly backend: DragBackend = null;
  private dragLayer?: DragLayer;
  private sourceRegistry = new Map<string, DragSource>();
  private targetRegistry = new Map<string, DropTarget>();
  private readonly unsubscribes = new WeakMap<any, any>();

  constructor(
    @Optional()
    @Inject(DRAG_BACKEND)
    private readonly backendFactory: any
  ) {
    if (!this.backendFactory) {
      throw new Error('No drag backend provided');
    }
    this.backend = backendFactory(this);
  }

  connectDragSource(dragSource: DragSource, node: any): Observable<DragBackendEvent> {
    const id = `drag_${this.idCounter++}`;
    dragSource.id = id;
    this.sourceRegistry.set(id, dragSource);
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
      this.sourceRegistry.delete(dragSource.id);
    }
  }

  connectDropTarget(dropTarget: DropTarget, node: any): Observable<DragBackendEvent> {
    const id = `drop_${this.idCounter++}`;
    dropTarget.id = id;
    this.targetRegistry.set(id, dropTarget);
    this.unsubscribes.set(dropTarget, this.backend.connectDropTarget(id, node));
    return this.backend.eventStream$.pipe(
      filter(event => event.targetId === id),
      map(({ sourceId, targetId, ...event }) => {
        if (sourceId) {
          const source = this.sourceRegistry.get(sourceId);
          if (source) {
            return { ...event, item: source.item, source, target: dropTarget };
          }
        }
        return event;
      })
    );
  }

  disconnectDropTarget(dropTarget: DropTarget): void {
    this.targetRegistry.delete(dropTarget.id);
    const unsubscribe = this.unsubscribes.get(dropTarget);
    if (unsubscribe) {
      unsubscribe();
      this.unsubscribes.delete(dropTarget);
    }
  }

  connectDragLayer(dragLayer: DragLayer): void {
    this.dragLayer = dragLayer;
  }

  canDrag(sourceId: string): boolean {
    const source = this.sourceRegistry.get(sourceId);
    return !!source && source.canDrag;
  }

  canDrop(targetId: string, sourceId): boolean {
    const target = this.targetRegistry.get(targetId);
    const source = this.sourceRegistry.get(sourceId);
    return (
      !!target &&
      !!source &&
      ((typeof target.itemType === 'object' && target.itemType.indexOf(source.itemType) > -1) ||
        (typeof target.itemType === 'string' && target.itemType === source.itemType)) &&
      ((typeof target.canDrop === 'function' && target.canDrop(source.item)) ||
        (typeof target.canDrop !== 'function' && target.canDrop))
    );
  }

  getPreviewImageForSourceId(sourceId: string): any | undefined {
    const source = this.sourceRegistry.get(sourceId);
    if (source && source.dragPreview instanceof TemplateRef) {
      return getEmptyImage();
    }
    if (source && source.dragPreview instanceof HTMLElement) {
      return source.dragPreview;
    }
    if (source) {
      return source.hostElement;
    }
    return undefined;
  }

  dragging$(itemType: string | string[]): Observable<boolean> {
    itemType = typeof itemType === 'string' ? [itemType] : itemType;
    return this.backend.eventStream$.pipe(
      filter(event => {
        const source = this.sourceRegistry.get(event.sourceId);
        return source && itemType.indexOf(source.itemType) > -1;
      }),
      filter(
        event =>
          event.type === DragBackendEventType.DRAG_START ||
          event.type === DragBackendEventType.DRAG_END ||
          event.type === DragBackendEventType.DROP
      ),
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
