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
export class IfDragging implements AfterViewInit, OnDestroy {
  @Input()
  set hideWhenOver(value: any) {
    this._hideWhenOver = coerceBoolean(value);
  }

  private _hideWhenOver = false;
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
      if (isDragging && (!this._hideWhenOver || (!isOver && this._hideWhenOver)) && !this.hasView) {
        this.show();
      } else if ((!isDragging || (!!isOver && this._hideWhenOver)) && this.hasView) {
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
