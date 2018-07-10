import {
  ContentChild,
  Directive,
  Input,
  AfterContentInit,
  OnDestroy,
  OnChanges,
  ElementRef,
  Renderer2
} from '@angular/core';
import { DropTarget } from './drop-target.directive';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[ccDropTargetDragging]',
  exportAs: 'ccDropTargetDragging'
})
// tslint:disable-next-line:directive-class-suffix
export class DropTargetDragging implements AfterContentInit, OnDestroy {
  isActive = false;

  @ContentChild(DropTarget) target: DropTarget;

  @Input()
  set ccDropTargetDragging(data: string[] | string) {
    const classes = Array.isArray(data) ? data : data.split(' ');
    this.classList = classes.filter(c => !!c);
  }

  private classList: string[] = [];
  private subscription: Subscription = Subscription.EMPTY;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngAfterContentInit(): void {
    if (!this.target) {
      return;
    }
    this.subscription = this.target.dragging$.subscribe(isDragging =>
      this.update(isDragging)
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private update(isDragging: boolean): void {
    if (!this.target) {
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
