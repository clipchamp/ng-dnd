import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { DragDispatcher2 } from './drag-dispatcher.service';
import { DragLayer } from './drag-layer.component';
import { DragSource } from './drag-source/drag-source.directive';
import { DragSourceDragging } from './drag-source/drag-source-dragging.directive';
import { DropTarget } from './drop-target/drop-target.directive';
import { DropTargetIsOver } from './drop-target/drop-target-over.directive';
import { DropTargetDragging } from './drop-target/drop-target-dragging.directive';
import { IfOver } from './drop-target/if-over.directive';
import { IfDragging } from './drop-target/if-dragging.directive';

const DECLARATIONS = [
  DragLayer,
  DragSource,
  DragSourceDragging,
  DropTarget,
  DropTargetIsOver,
  DropTargetDragging,
  IfOver,
  IfDragging
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
