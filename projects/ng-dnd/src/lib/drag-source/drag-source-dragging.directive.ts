import {
  Directive,
  AfterContentInit,
  Input,
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
export class DragSourceDragging implements AfterContentInit, OnDestroy {
  isActive = false;

  @ContentChild(DragSource) source: DragSource;

  @Input()
  set ccDragSourceDragging(data: string[] | string) {
    const isActive = this.isActive;
    if (this.isActive && this.classList.length > 0) {
      this.classList.map(c => {
        this.renderer.removeClass(this.elementRef.nativeElement, c);
      });
      this.isActive = false;
    }
    const classes = Array.isArray(data) ? data : data.split(' ');
    this.classList = classes.filter(c => !!c);
    this.update(isActive);
  }

  private classList: string[] = [];
  private subscription: Subscription = Subscription.EMPTY;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngAfterContentInit(): void {
    if (!this.source) {
      return;
    }
    this.subscription = this.source.dragging.subscribe(isDragging => this.update(isDragging));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private update(isDragging: boolean): void {
    if (!this.source) {
      return;
    }

    Promise.resolve().then(() => {
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
