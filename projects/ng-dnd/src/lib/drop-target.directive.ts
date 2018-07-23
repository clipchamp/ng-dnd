import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Output,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Subject, Subscription, Observable } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { DragDispatcher2 } from './drag-dispatcher.service';
import { DragBackendEvent } from './backends/drag-backend-event';
import { DragBackendEventType } from './backends/drag-backend-event-type';

@Directive({
  selector: '[ccDropTarget]',
  exportAs: 'ccDropTarget'
})
// tslint:disable-next-line:directive-class-suffix
export class DropTarget implements AfterViewInit, OnChanges, OnDestroy {
  id: string;
  isOver = false;

  @Input() itemType!: string | string[];
  @Input() canDrop: any = true;
  @Output() hovered = new EventEmitter<any>();
  @Output() dropped = new EventEmitter<any>();
  @Output() dragging = new EventEmitter<boolean>();

  private subscription = Subscription.EMPTY;
  private readonly destroyed = new Subject<void>();
  private readonly eventStream = new Subject<DragBackendEvent>();

  eventStream$: Observable<DragBackendEvent> = this.eventStream.asObservable();

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
      .subscribe(ev => {
        this.isOver = true;
        this.hovered.emit(ev);
      });
    this.eventStream
      .pipe(
        filter(
          event =>
            event.type === DragBackendEventType.DRAG_OUT || event.type === DragBackendEventType.DROP
        ),
        distinctUntilChanged(
          (eventA, eventB) =>
            eventA.clientOffset.x === eventB.clientOffset.x &&
            eventA.clientOffset.y === eventB.clientOffset.y
        ),
        takeUntil(this.destroyed)
      )
      .subscribe(() => {
        this.isOver = false;
        this.hovered.emit(undefined);
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.itemType) {
      this.subscription.unsubscribe();
      this.subscription = this.dragDispatcher
        .dragging$(this.itemType)

        .subscribe(this.dragging);
    }
  }

  ngOnDestroy(): void {
    this.dragDispatcher.disconnectDropTarget(this);
    this.destroyed.next();
    this.destroyed.complete();
  }
}
