import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ccDragItem]'
})
// tslint:disable-next-line:directive-class-suffix
export class DragItem {
  constructor(public readonly templateRef: TemplateRef<any>) {}
}
