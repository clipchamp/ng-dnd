import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { DragDispatcher2 } from './drag-dispatcher.service';
import { DragLayer } from './drag-layer.component';
import { DragSource } from './drag-source.directive';
import { DropTarget } from './drop-target.directive';
import { DragSourceDragging } from './drag-source-dragging.directive';
import { DropTargetIsOver } from './drop-target-over.directive';
import { DropTargetDragging } from './drop-target-dragging.directive';
import { DragContainer } from './drag-container.component';
import { DragItem } from './drag-item.directive';

const DECLARATIONS = [
  DragContainer,
  DragItem,
  DragSource,
  DropTarget,
  DragLayer,
  DragSourceDragging,
  DropTargetIsOver,
  DropTargetDragging
];

@NgModule({
  imports: [CommonModule],
  declarations: DECLARATIONS,
  providers: [DragDispatcher2],
  exports: DECLARATIONS
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
