import {
  Directive,
  AfterViewInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  Input
} from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { DropTarget } from './drop-target.directive';
import { coerceBoolean } from '../utils/coercion';

@Directive({
  selector: '[ccIfDragging]'
})
export class IfDraggingDirective implements AfterViewInit, OnDestroy {
  @Input()
  set ccIfDragging(value: boolean) {
    this.showWhenOver = coerceBoolean(value);
  }

  private showWhenOver = true;
  private subscription = Subscription.EMPTY;
  private hasView = false;

  constructor(
    private readonly parent: DropTarget,
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainerRef: ViewContainerRef
  ) {}

  ngAfterViewInit(): void {
    this.subscription.unsubscribe();
    if (!this.parent) {
      return;
    }
    this.subscription = combineLatest(
      this.parent.dragging,
      this.parent.hovered.pipe(startWith(undefined))
    ).subscribe(([isDragging, isOver]) => {
      if (isDragging && (this.showWhenOver || (!isOver && !this.showWhenOver)) && !this.hasView) {
        this.show();
      } else if ((!isDragging || (!!isOver && !this.showWhenOver)) && this.hasView) {
        this.hide();
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private show(): void {
    this.viewContainerRef.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }

  private hide(): void {
    this.viewContainerRef.clear();
    this.hasView = false;
  }
}
