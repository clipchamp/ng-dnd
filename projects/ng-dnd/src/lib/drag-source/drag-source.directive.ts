import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  Optional,
  NgZone
} from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, take, takeUntil, map } from 'rxjs/operators';
import { DragDispatcher2 } from '../drag-dispatcher.service';
import { DragBackendEventType } from '../backends/drag-backend-event-type';
import { DropTarget } from '../drop-target/drop-target.directive';
import { enterZone } from 'projects/ng-dnd/src/lib/utils/enter-zone';

@Directive({
  selector: '[ccDragSource]',
  exportAs: 'ccDragSource'
})
export class DragSource<T = any> implements AfterViewInit, OnDestroy {
  id!: string;

  @Input() item!: T;
  @Input() itemType!: string;
  @Input() canDrag = true;
  @Input() dragPreview?: HTMLElement | TemplateRef<any>;
  @Output() dragging = new EventEmitter<boolean>();
  @Output() dropped = new EventEmitter<T>();

  get hostElement(): any {
    return this.elementRef.nativeElement;
  }

  get isDragging(): boolean {
    return this._isDragging;
  }

  set isDragging(value: boolean) {
    this._isDragging = value;
    this.dragging.emit(value);
  }

  get canDrop(): boolean {
    return this._canDrop;
  }

  set canDrop(value: boolean) {
    this._canDrop = value;
  }

  get bounds(): DOMRect {
    return this.hostElement.getBoundingClientRect();
  }

  private _isDragging = false;
  private _canDrop = false;
  private readonly eventStream = new Subject<any>();

  constructor(
    private readonly ngZone: NgZone,
    private readonly elementRef: ElementRef,
    private readonly dragDispatcher: DragDispatcher2,
    @Optional() public readonly parent?: DropTarget
  ) {
    this.eventStream
      .pipe(filter(event => event.type === DragBackendEventType.DRAG_START))
      .subscribe(() => this.beginDrag());

    this.eventStream
      .pipe(
        filter(event => event.type === DragBackendEventType.DROP),
        map(event => event.item),
        enterZone(this.ngZone)
      )
      .subscribe(this.dropped);
  }

  ngAfterViewInit(): void {
    this.dragDispatcher.connectDragSource(this, this.hostElement).subscribe(this.eventStream);
  }

  ngOnDestroy(): void {
    this.dragDispatcher.disconnectDragSource(this);
    this.eventStream.complete();
  }

  private beginDrag(): void {
    this.isDragging = true;
    const endDrag$ = this.eventStream.pipe(
      filter(
        event =>
          event.type === DragBackendEventType.DROP || event.type === DragBackendEventType.DRAG_END
      ),
      take(1)
    );
    endDrag$.pipe(enterZone(this.ngZone)).subscribe(() => {
      this.isDragging = false;
      this.canDrop = false;
    });
    this.eventStream
      .pipe(
        filter(event => event.type === DragBackendEventType.DRAG_OVER),
        distinctUntilChanged(
          (eventA, eventB) =>
            eventA.clientOffset.x === eventB.clientOffset.x &&
            eventA.clientOffset.y === eventB.clientOffset.y
        ),
        takeUntil(endDrag$),
        enterZone(this.ngZone)
      )
      .subscribe(event => {
        console.warn('Is in angular zone?', NgZone.isInAngularZone());
        this.canDrop = !!event.targetId;
      });
  }
}
