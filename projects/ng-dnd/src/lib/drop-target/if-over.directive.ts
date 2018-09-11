import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  OnDestroy,
  AfterViewInit,
  Host,
  Optional
} from '@angular/core';
import { DropTarget } from './drop-target.directive';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[ccIfOver]'
})
export class IfOver implements AfterViewInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  private hasView = false;

  constructor(
    private readonly templateRef: TemplateRef<any>,
    private readonly viewContainerRef: ViewContainerRef,
    @Host()
    @Optional()
    private readonly parent: DropTarget
  ) {}

  ngAfterViewInit(): void {
    this.subscription.unsubscribe();
    if (!this.parent) {
      return;
    }
    this.subscription = this.parent.hovered.subscribe(event => {
      if (!!event && !this.hasView) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
        this.hasView = true;
      } else if (!event && this.hasView) {
        this.viewContainerRef.clear();
        this.hasView = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
