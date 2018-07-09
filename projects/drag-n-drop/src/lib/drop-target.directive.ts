import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  Input
} from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { DragDispatcher2 } from './drag-dispatcher.service';
import { DragBackendEvent } from './backends/drag-backend-event';
import { DragBackendEventType } from './backends/drag-backend-event-type';

@Directive({
  selector: '[ccDropTarget]',
  exportAs: 'ccDropTarget'
})
// tslint:disable-next-line:directive-class-suffix
export class DropTarget implements AfterViewInit, OnDestroy {
  id: string;
  isOver = false;

  @Input() itemType!: string | string[];
  @Input() canDrop: any = true;
  @Output() hovered = new EventEmitter<boolean>();
  @Output() dropped = new EventEmitter<DragBackendEvent>();

  private readonly destroyed = new Subject<void>();
  private readonly eventStream = new Subject<DragBackendEvent>();

  private get hostElement(): any {
    return this.elementRef.nativeElement;
  }

  constructor(
    private readonly elementRef: ElementRef,
    private readonly dragDispatcher: DragDispatcher2
  ) {
    this.eventStream
      .pipe(
        filter(event => event.type === DragBackendEventType.DRAG_OVER),
        distinctUntilChanged(
          (eventA, eventB) =>
            eventA.clientOffset.x === eventB.clientOffset.x &&
            eventA.clientOffset.y === eventB.clientOffset.y
        ),
        takeUntil(this.destroyed)
      )
      .subscribe(() => {
        this.isOver = true;
        this.hovered.emit(true);
      });
    this.eventStream
      .pipe(
        filter(
          event =>
            event.type === DragBackendEventType.DRAG_OUT ||
            event.type === DragBackendEventType.DROP
        ),
        takeUntil(this.destroyed)
      )
      .subscribe(event => {
        this.isOver = false;
        this.hovered.emit(false);
      });
    this.eventStream
      .pipe(
        filter(event => event.type === DragBackendEventType.DROP),
        takeUntil(this.destroyed)
      )
      .subscribe(this.dropped);
  }

  ngAfterViewInit(): void {
    this.dragDispatcher
      .connectDropTarget(this, this.hostElement)
      .pipe(takeUntil(this.destroyed))
      .subscribe(this.eventStream);
  }

  ngOnDestroy(): void {
    this.dragDispatcher.disconnectDropTarget(this);
    this.destroyed.next();
    this.destroyed.complete();
  }
}
