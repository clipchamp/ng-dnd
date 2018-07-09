import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  TemplateRef
} from '@angular/core';
import { DragDispatcher2 } from './drag-dispatcher.service';

@Component({
  selector: 'cc-drag-layer',
  template: `<div [style.position]="'fixed'"
					[style.pointer-events]="'none'"
					[style.left.px]="preview.context.position.x"
                    [style.top.px]="preview.context.position.y"
                    [style.z-index]="9999"
					*ngFor="let preview of previewAsArray">
					<ng-container *ngTemplateOutlet="preview?.template; context: preview?.context"></ng-container>
				</div>`
})
// tslint:disable-next-line:component-class-suffix
export class DragLayer implements AfterViewInit {
  private readonly previews: {
    [id: string]: { id: string; template: any; context: any };
  } = {};

  constructor(
    private readonly dragDispatcher: DragDispatcher2,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.dragDispatcher.connectDragLayer(this);
    this.cdRef.detach();
  }

  showPreview(id: string, template: TemplateRef<any>, context: any): void {
    this.previews[id] = {
      id,
      template,
      context
    };
    this.cdRef.detectChanges();
  }

  updatePreview(id: string, context: any): void {
    if (!this.previews[id].context.position) {
      return;
    }
    this.previews[id].context = context;
    this.cdRef.detectChanges();
  }

  hidePreview(id: string): void {
    delete this.previews[id];
    this.cdRef.detectChanges();
  }

  get previewAsArray(): { id: string; template: any; context: any }[] {
    return Object.keys(this.previews).map(id => this.previews[id]);
  }
}
