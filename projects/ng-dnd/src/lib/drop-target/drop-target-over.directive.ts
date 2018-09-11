import {
  Directive,
  AfterContentInit,
  Input,
  Renderer2,
  ElementRef,
  OnDestroy,
  ContentChild
} from '@angular/core';
import { DropTarget } from './drop-target.directive';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[ccDropTargetOver]',
  exportAs: 'ccDropTargetOver'
})
export class DropTargetIsOver implements AfterContentInit, OnDestroy {
  isActive = false;

  @ContentChild(DropTarget) target: DropTarget;

  @Input()
  set ccDropTargetOver(data: string[] | string) {
    if (this.isActive && this.classList.length > 0) {
      this.classList.map(c => {
        this.renderer.removeClass(this.elementRef.nativeElement, c);
      });
      this.isActive = false;
    }
    const classes = Array.isArray(data) ? data : data.split(' ');
    this.classList = classes.filter(c => !!c);
    this.update();
  }

  private classList: string[] = [];
  private subscription: Subscription = Subscription.EMPTY;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngAfterContentInit(): void {
    if (!this.target) {
      return;
    }
    this.subscription = this.target.hovered.subscribe(_ => this.update());
    this.update();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private update(): void {
    if (!this.target) {
      return;
    }

    Promise.resolve().then(() => {
      const isOver = this.target.isOver;
      if (this.isActive !== isOver) {
        this.isActive = isOver;
        this.classList.map(c => {
          if (isOver) {
            this.renderer.addClass(this.elementRef.nativeElement, c);
          } else {
            this.renderer.removeClass(this.elementRef.nativeElement, c);
          }
        });
      }
    });
  }
}
