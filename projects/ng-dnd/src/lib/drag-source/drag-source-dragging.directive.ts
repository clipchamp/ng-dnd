import {
  Directive,
  AfterContentInit,
  Input,
  OnChanges,
  Renderer2,
  ElementRef,
  ContentChild,
  OnDestroy
} from '@angular/core';
import { DragSource } from './drag-source.directive';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[ccDragSourceDragging]',
  exportAs: 'ccDragSourceDragging'
})
export class DragSourceDragging implements AfterContentInit, OnChanges, OnDestroy {
  isActive = false;

  @ContentChild(DragSource) source: DragSource;

  @Input()
  set ccDragSourceDragging(data: string[] | string) {
    const classes = Array.isArray(data) ? data : data.split(' ');
    this.classList = classes.filter(c => !!c);
  }

  private classList: string[] = [];
  private subscription: Subscription = Subscription.EMPTY;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngAfterContentInit(): void {
    if (!this.source) {
      return;
    }
    this.subscription = this.source.dragging.subscribe(_ => this.update());
    this.update();
  }

  ngOnChanges(): void {
    this.update();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private update(): void {
    if (!this.source) {
      return;
    }

    Promise.resolve().then(() => {
      const isDragging = this.source.isDragging;
      if (this.isActive !== isDragging) {
        this.isActive = isDragging;
        this.classList.map(c => {
          if (isDragging) {
            this.renderer.addClass(this.elementRef.nativeElement, c);
          } else {
            this.renderer.removeClass(this.elementRef.nativeElement, c);
          }
        });
      }
    });
  }
}
