import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { DragDispatcher2 } from './drag-dispatcher.service';
import { DragLayer } from './drag-layer.component';
import { DragSource } from './drag-source.directive';
import { DropTarget } from './drop-target.directive';
import { DragSourceDragging } from './drag-source-dragging.directive';
import { DropTargetIsOver } from './drop-target-is-over.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [
    DragSource,
    DropTarget,
    DragLayer,
    DragSourceDragging,
    DropTargetIsOver
  ],
  providers: [DragDispatcher2],
  exports: [
    DragSource,
    DropTarget,
    DragLayer,
    DragSourceDragging,
    DropTargetIsOver
  ]
})
export class DragModule {
  static forFeature(): ModuleWithProviders {
    return {
      ngModule: DragModule,
      providers: []
    };
  }
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DragModule,
      providers: [DragDispatcher2]
    };
  }
}
