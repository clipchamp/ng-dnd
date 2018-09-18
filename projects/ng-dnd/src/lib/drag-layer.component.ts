import { AfterViewInit, ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { DragDispatcher2 } from './drag-dispatcher.service';
import { Observable } from 'rxjs';
import { DragSource } from './drag-source/drag-source.directive';
import { DragBackendEvent } from './backends/drag-backend-event';

@Component({
  selector: 'cc-drag-layer',
  template: `
        <div class="drag-preview"
            [class.drag-preview--show]="preview.show && (dragPreviewsEnabled$ | async)"
            [style.transform]="transform(preview.context)"
            [style.width.px]="preview.context.sourceOffset.width"
            [style.height.px]="preview.context.sourceOffset.height"
            *ngFor="let preview of previewAsArray">
          <ng-container *ngTemplateOutlet="preview?.template; context: preview?.context"></ng-container>
        </div>`,
  styles: [
    `
      .drag-preview {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 9999;
        pointer-events: none;
        opacity: 0;
        transition: opacity 60ms ease-in-out;
        will-change: transform;
      }

      .drag-preview--show {
        opacity: 1;
      }
    `
  ]
})
export class DragLayer implements AfterViewInit {
  private readonly previews: {
    [id: string]: { id: string; template: any; context: any; show: boolean };
  } = {};

  dragPreviewsEnabled$: Observable<boolean>;

  constructor(
    private readonly dragDispatcher: DragDispatcher2,
    private readonly cdRef: ChangeDetectorRef
  ) {
    this.dragPreviewsEnabled$ = this.dragDispatcher.dragPreviewsEnabled$;
  }

  ngAfterViewInit(): void {
    this.dragDispatcher.connectDragLayer(this);
    this.cdRef.detach();
  }

  showPreview(id: string, template: TemplateRef<any>, context: any): void {
    const isNew = !this.previews[id];
    this.previews[id] = {
      id,
      template,
      context,
      show: !isNew
    };
    this.cdRef.detectChanges();
    if (isNew) {
      requestAnimationFrame(() => {
        if (this.previews[id]) {
          this.previews[id].show = true;
        }
      });
    }
  }

  hidePreview(id: string): void {
    delete this.previews[id];
    this.cdRef.detectChanges();
  }

  transform(context: any): string {
    if (!context || !context.clientOffset) {
      return 'none';
    }
    return `translate3d(${context.clientOffset.x - context.sourceOffset.x}px, ${context.clientOffset
      .y - context.sourceOffset.y}px, 0)`;
  }

  get previewAsArray(): { id: string; template: any; context: any; show: boolean }[] {
    return Object.keys(this.previews).map(id => this.previews[id]);
  }
}
