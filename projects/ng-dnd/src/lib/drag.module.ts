import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { DragDispatcher2 } from './drag-dispatcher.service';
import { DragLayer } from './drag-layer.component';
import { DragSource, DragSourceDragging } from './drag-source';
import {
  DropTarget,
  DropTargetIsOver,
  DropTargetDragging,
  IfOver,
  IfDragging
} from './drop-target';

const DECLARATIONS = [
  DragSource,
  DropTarget,
  DragLayer,
  DragSourceDragging,
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
